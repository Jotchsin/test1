import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import QRCode from "qrcode";
import axios from "axios";

interface Event {
  id: number;
  name: string;
  photo?: string;
  location?: string;
  date?: string;
  time?: string;
  description?: string;
  shareLink?: string;
  respondents?: Respondent[];
  rsvp?: number[];
}

interface Respondent {
  email: string;
  response: "Yes" | "No";
}

const RSVP = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [response, setResponse] = useState<"Yes" | "No" | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [step, setStep] = useState<"register" | "verify" | "rsvp" | "qr" | "confirmed">("register");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (eventId) {
      const publishedEvents = JSON.parse(localStorage.getItem("publishedEvents") || "[]");
      const foundEvent = publishedEvents.find((e: Event) => e.id === parseInt(eventId));
      setEvent(foundEvent || null);
    }
  }, [eventId]);

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post('http://localhost:8000/api/verify-code', {
        email: email,
        code: verificationCode
      });

      setStep("rsvp");
    } catch (error: any) {
      setError(error.response?.data?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRSVP = (rsvpResponse: "Yes" | "No") => {
    if (!event) return;

    setResponse(rsvpResponse);

    // Update event respondents
    const publishedEvents = JSON.parse(localStorage.getItem("publishedEvents") || "[]");
    const updatedEvents = publishedEvents.map((e: Event) => {
      if (e.id === event.id) {
        const newRespondents = e.respondents || [];
        const existingIndex = newRespondents.findIndex(r => r.email === email);
        const previousResponse = existingIndex >= 0 ? newRespondents[existingIndex].response : null;

        if (existingIndex >= 0) {
          newRespondents[existingIndex] = { email, response: rsvpResponse };
        } else {
          newRespondents.push({ email, response: rsvpResponse });
        }

        const newRsvp = [...(e.rsvp || [0, 0])];

        // Decrement previous response if it exists
        if (previousResponse === "Yes") {
          newRsvp[0] = Math.max(0, newRsvp[0] - 1);
        } else if (previousResponse === "No") {
          newRsvp[1] = Math.max(0, newRsvp[1] - 1);
        }

        // Increment new response
        if (rsvpResponse === "Yes") {
          newRsvp[0]++;
        } else {
          newRsvp[1]++;
        }

        return { ...e, respondents: newRespondents, rsvp: newRsvp };
      }
      return e;
    });

    localStorage.setItem("publishedEvents", JSON.stringify(updatedEvents));

    // Only generate QR code for "Yes" responses
    if (rsvpResponse === "Yes") {
      const qrData = JSON.stringify({
        eventId: event.id,
        email,
        response: rsvpResponse,
      });

      QRCode.toDataURL(qrData).then(url => {
        setQrCode(url);
        setStep("qr");
      }).catch(err => {
        console.error("QR Code generation failed:", err);
        alert("Failed to generate QR code. Please try again.");
      });
    } else {
      // For "No" responses, show confirmation without QR code
      setStep("confirmed");
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-200 via-pink-100 to-yellow-100">
        <div className="bg-white/60 backdrop-blur-md shadow-lg rounded-xl w-full max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Event Not Found</h2>
          <p className="text-gray-600 mb-4">
            This event may not be published yet, or the link might be incorrect.
          </p>
          <p className="text-sm text-gray-500">
            Make sure to publish the event from the Manage page first, then copy the RSVP link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-200 via-pink-100 to-yellow-100">
      <div className="bg-white/60 backdrop-blur-md shadow-lg rounded-xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center mb-8">{event.name}</h2>

        {event.photo && (
          <img src={event.photo} alt={event.name} className="w-full h-48 object-cover rounded-lg mb-4" />
        )}

        <div className="mb-4">
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Date:</strong> {event.date}</p>
          <p><strong>Time:</strong> {event.time}</p>
          {event.description && <p><strong>Description:</strong> {event.description}</p>}
        </div>

        {step === "register" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Register with Gmail</h3>
            <input
              type="email"
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
            <button
              onClick={handleRegister}
              className="w-full py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              Continue
            </button>
          </div>
        )}

        {step === "rsvp" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Will you attend?</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleRSVP("Yes")}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Yes
              </button>
              <button
                onClick={() => handleRSVP("No")}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                No
              </button>
            </div>
          </div>
        )}

        {step === "qr" && (
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">Your RSVP QR Code</h3>
            <p>Scan this QR code at the event for check-in</p>
            {qrCode && <img src={qrCode} alt="QR Code" className="mx-auto" />}
            <p className="text-sm text-gray-600">Response: {response}</p>
          </div>
        )}

        {step === "confirmed" && (
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">RSVP Confirmed</h3>
            <p className="text-gray-600">Thank you for letting us know you won't be able to attend.</p>
            <p className="text-sm text-gray-500">Your response has been recorded.</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">Response: {response}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RSVP;