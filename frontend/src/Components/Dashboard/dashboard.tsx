import { useState, useEffect, useRef } from "react";
import { FiTrash2, FiLink } from "react-icons/fi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import DashboardNavbar from "./NavbarInside";

type Respondent = {
  email: string;
  response: "Yes" | "No";
};

type Event = {
  id: number;
  name: string;
  photo?: string;
  location?: string;
  date?: string;
  time?: string;
  participants?: number[];
  rsvp?: number[]; // [Yes, No]
  respondents?: Respondent[];
  finishedAt?: string;
};

const Dashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventHistory, setEventHistory] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const eventsRef = useRef<Event[]>([]);
  const historyRef = useRef<Event[]>([]);

  useEffect(() => {
    const storedEvents: Event[] = JSON.parse(
      localStorage.getItem("publishedEvents") || "[]"
    );

    // Use actual respondents data from RSVP system, don't add fake data
    const enrichedEvents = storedEvents.map((event) => {
      // Ensure respondents array exists (initialize if not present)
      const respondents = event.respondents || [];

      // Calculate RSVP counts from actual respondents
      const yesCount = respondents.filter(r => r.response === "Yes").length;
      const noCount = respondents.filter(r => r.response === "No").length;

      return {
        ...event,
        respondents: respondents,
        rsvp: [yesCount, noCount],
        // Don't initialize participants - keep as undefined until someone scans QR
      };
    });

    setEvents(enrichedEvents);
    eventsRef.current = enrichedEvents;

    const storedHistory = JSON.parse(
      localStorage.getItem("eventHistory") || "[]"
    );
    setEventHistory(storedHistory);
    historyRef.current = storedHistory;
  }, []);

  /* =============================
     AUTO MOVE FINISHED EVENTS
  ============================== */
  useEffect(() => {
    const checkAndMoveEvents = () => {
      const now = new Date();
      const active: Event[] = [];
      const finished: Event[] = [];

      for (const event of eventsRef.current) {
        if (event.date && event.time) {
          const eventTime = new Date(`${event.date}T${event.time}`);
          if (eventTime < now) {
            if (!historyRef.current.some((h) => h.id === event.id)) {
              finished.push({
                ...event,
                finishedAt: new Date().toISOString(),
              });
            }
          } else {
            active.push(event);
          }
        } else {
          active.push(event);
        }
      }

      const twoDays = 2 * 24 * 60 * 60 * 1000;
      const filteredHistory = [...historyRef.current, ...finished].filter(
        (e) =>
          !e.finishedAt ||
          now.getTime() - new Date(e.finishedAt).getTime() < twoDays
      );

      eventsRef.current = active;
      historyRef.current = filteredHistory;

      setEvents(active);
      setEventHistory(filteredHistory);

      localStorage.setItem("publishedEvents", JSON.stringify(active));
      localStorage.setItem("eventHistory", JSON.stringify(filteredHistory));
    };

    checkAndMoveEvents();
    const interval = setInterval(checkAndMoveEvents, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  /* =============================
     ACTIONS
  ============================== */
  const handleDelete = (id: number) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    eventsRef.current = updated;
    localStorage.setItem("publishedEvents", JSON.stringify(updated));
    if (selectedEvent?.id === id) setSelectedEvent(null);
  };

  const handleCopyLink = (id: number) => {
    const rsvpLink = `${window.location.origin}/rsvp/${id}`;
    navigator.clipboard.writeText(rsvpLink);
    alert("RSVP link copied!");
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear all event history?")) {
      setEventHistory([]);
      historyRef.current = [];
      localStorage.setItem("eventHistory", JSON.stringify([]));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 🔒 BACKGROUND — UNCHANGED */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[700px] h-[700px] bg-teal-300 rounded-full blur-[180px] opacity-40 top-[-100px] left-[-150px]" />
        <div className="absolute w-[600px] h-[600px] bg-pink-300 rounded-full blur-[180px] opacity-40 top-[200px] left-[300px]" />
        <div className="absolute w-[600px] h-[600px] bg-orange-300 rounded-full blur-[180px] opacity-40 top-[200px] right-[-150px]" />
        <div className="absolute w-[500px] h-[500px] bg-green-300 rounded-full blur-[180px] opacity-40 bottom-[-100px] right-[100px]" />
      </div>

      <DashboardNavbar />

      <div className="relative p-6">
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* LEFT */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md p-4">
              <h2 className="font-semibold text-lg mb-3">
                Published Events
              </h2>

              {events.length === 0 ? (
                <p className="text-gray-500">No events published yet. Go to Manage to publish events.</p>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`flex justify-between items-center bg-gray-100 rounded-xl px-4 py-2 cursor-pointer hover:bg-gray-200 transition ${
                      selectedEvent?.id === event.id
                        ? "border border-black"
                        : ""
                    }`}
                  >
                    <span className="truncate text-gray-700 font-medium">
                      {event.name} / {event.location || "—"} /{" "}
                      {event.date || "—"} / {event.time || "—"}
                    </span>

                    <div className="flex gap-3">
                      <FiLink
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(event.id);
                        }}
                        title="Copy RSVP Link"
                      />
                      <FiTrash2
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(event.id);
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-lg">Event History</h2>
                {eventHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {eventHistory.length === 0 ? (
                <p className="text-gray-500">No past events yet.</p>
              ) : (
                eventHistory.map((event) => (
                  <p key={event.id} className="text-gray-700">
                    {event.name}
                  </p>
                ))
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md p-4 h-64">
              <h2 className="font-semibold text-lg mb-3">
                Participants Graph
              </h2>

              {selectedEvent?.participants && selectedEvent.participants.length > 0 ? (
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart
                    data={selectedEvent.participants.map((p, i) => ({
                      name: `Day ${i + 1}`,
                      value: p,
                    }))}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center mt-10">
                  No attendance data yet.
                </p>
              )}
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md p-4 h-64">
              <h2 className="font-semibold text-lg mb-3">RSVP Chart</h2>

              {selectedEvent?.rsvp && (selectedEvent.rsvp[0] > 0 || selectedEvent.rsvp[1] > 0) ? (
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart
                    data={[
                      { name: "Yes", value: selectedEvent.rsvp[0] },
                      { name: "No", value: selectedEvent.rsvp[1] },
                    ]}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#EC4899" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center mt-10">
                  No RSVPs yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
