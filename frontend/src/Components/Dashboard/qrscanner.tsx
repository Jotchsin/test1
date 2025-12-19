import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import DashboardNavbar from "./NavbarInside";

QrScanner.WORKER_PATH = "/qr-scanner-worker.min.js";

type QRData = {
  eventId?: number;
  email?: string;
  response?: string;
  [key: string]: unknown;
};

export default function ScannerEvent() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<QRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<QrScanner | null>(null);

  const markAttendance = (eventId: number, email: string) => {
    const publishedEvents = JSON.parse(localStorage.getItem("publishedEvents") || "[]");
    const updatedEvents = publishedEvents.map((event: any) => {
      if (event.id === eventId) {
        const attendees = event.attendees || [];
        const alreadyAttended = attendees.some((a: any) => a.email === email);
        if (!alreadyAttended) {
          attendees.push({
            name: email.split('@')[0], // Simple name from email
            email,
            status: "Present"
          });

          // Initialize participants array if it doesn't exist, then increment attendance count
          const participants = event.participants || [0];
          participants[0] = (participants[0] || 0) + 1;
          return { ...event, attendees, participants };
        }
        return { ...event, attendees };
      }
      return event;
    });
    localStorage.setItem("publishedEvents", JSON.stringify(updatedEvents));
  };

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      if (!videoRef.current) return;
      try {
        const qrScanner = new QrScanner(
          videoRef.current,
          (res: QrScanner.ScanResult | string | null) => {
            if (!res) return;
            const text = typeof res === "string" ? res : res.data ?? "";
            if (!text) return;
            if (!mounted) return;

            setResult(text);
            setIsScanning(false);

            try {
              const parsed = JSON.parse(text);
              setParsedData(parsed);

              // Mark attendance if it's RSVP QR
              if (parsed.eventId && parsed.email) {
                markAttendance(parsed.eventId, parsed.email);
              }
            } catch {
              setParsedData(null);
            }

            // stop after read; you can remove this if you want continuous reads
            qrScanner.stop();
          },
          {
            preferredCamera: "environment",
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
          }
        );

        scannerRef.current = qrScanner;
        await qrScanner.start();
        setIsScanning(true);
        console.log("🎥 Scanner started");
      } catch (err) {
        console.error("Scanner error:", err);
        setError("Cannot access camera. Allow camera in site settings or use localhost/HTTPS.");
      }
    };

    start();

    return () => {
      mounted = false;
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, []);

  const handleRescan = async () => {
    setResult(null);
    setParsedData(null);
    setError(null);
    try {
      await scannerRef.current?.start();
      setIsScanning(true);
    } catch {
      setError("Cannot restart camera. Check permissions.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-teal-100">
      <DashboardNavbar />

      <div className="flex flex-col items-center justify-center py-10 px-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">QR Code Scanner</h1>

        <div className="rounded-xl overflow-hidden border-4 border-indigo-500 shadow-md w-[320px] h-[320px] bg-gray-200 flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover rounded-lg" autoPlay muted />
        </div>

        <div className="mt-3 text-gray-500">
          {isScanning && !result ? "📷 Scanning for QR code..." : !isScanning && !result ? "Ready" : ""}
        </div>

        <div className="mt-5 w-full max-w-md text-center">
          {error && <p className="text-red-500">{error}</p>}

          {!error && parsedData ? (
            <div className="bg-white/80 backdrop-blur p-5 rounded-xl shadow-md text-left space-y-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Scanned Information:</h2>
              {parsedData.eventId ? (
                <>
                  <p className="text-gray-700"><span className="font-medium">Event ID:</span> {parsedData.eventId}</p>
                  <p className="text-gray-700"><span className="font-medium">Email:</span> {parsedData.email ?? "N/A"}</p>
                  <p className="text-gray-700"><span className="font-medium">RSVP:</span> {parsedData.response ?? "N/A"}</p>
                  <p className="text-green-600 font-medium">✅ Attendance marked!</p>
                </>
              ) : (
                <>
                  <p className="text-gray-700"><span className="font-medium">Name:</span> {parsedData.name ?? "N/A"}</p>
                  <p className="text-gray-700"><span className="font-medium">Email:</span> {parsedData.email ?? "N/A"}</p>
                  <p className="text-gray-700"><span className="font-medium">RSVP:</span> {parsedData.rsvp ?? "N/A"}</p>
                </>
              )}
            </div>
          ) : !error && result ? (
            <div className="bg-white/80 backdrop-blur p-4 rounded-lg shadow text-left">
              <h2 className="font-semibold text-gray-700 mb-2">Scanned Text:</h2>
              <p className="text-gray-800 break-all text-sm">{result}</p>
            </div>
          ) : (
            !error && <p className="text-gray-500">Waiting for QR code...</p>
          )}
        </div>

        <div className="mt-6">
          <button onClick={handleRescan} className="bg-indigo-500 text-white px-4 py-2 rounded-full">
            Rescan
          </button>
        </div>
      </div>
    </div>
  );
}
