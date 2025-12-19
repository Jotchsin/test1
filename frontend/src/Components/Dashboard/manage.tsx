import React, { useState, useEffect } from "react";
import { Trash2, Image as ImageIcon } from "lucide-react";
import DashboardNavbar from "./NavbarInside";

interface Event {
  id: number;
  name: string;
  photo?: string;
  location?: string;
  date?: string;
  time?: string;
  duration?: string;
  capacity?: string;
  type?: string;
  visibility?: string;
  description?: string;
  shareLink?: string;
}

const ManageEvent: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    try {
      const storedEvents = JSON.parse(localStorage.getItem("events") || "[]");
      setEvents(storedEvents);
    } catch (e) {
      console.error("Error loading events:", e);
      setEvents([]);
    }
  }, []);

  const handleSelect = (event: Event) => {
    setSelectedEvent(event);
    setIsEditing(false);
  };

  const handleDelete = (id: number) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    localStorage.setItem("events", JSON.stringify(updated));
    if (selectedEvent?.id === id) setSelectedEvent(null);
  };

  const handleEditToggle = () => setIsEditing(true);

  const handleConfirmEdit = () => {
    if (!selectedEvent) return;
    
    const updatedEvents = events.map(e => 
      e.id === selectedEvent.id ? selectedEvent : e
    );
    setEvents(updatedEvents);
    localStorage.setItem("events", JSON.stringify(updatedEvents));
    setIsEditing(false);
    
    setPopupMessage("✅ Event updated successfully!");
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  };

  const handleChange = (field: keyof Event, value: string) => {
    if (selectedEvent) {
      setSelectedEvent({ ...selectedEvent, [field]: value });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange("photo", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = () => {
    if (!selectedEvent) return;
    const publishedEvents = JSON.parse(
      localStorage.getItem("publishedEvents") || "[]"
    );

    const alreadyPublished = publishedEvents.some(
      (e: Event) => e.id === selectedEvent.id
    );

    if (!alreadyPublished) {
      const eventWithLink = {
        ...selectedEvent,
        shareLink: `${window.location.origin}/rsvp/${selectedEvent.id}`,
        respondents: [],
        rsvp: [0, 0], // [Yes, No]
      };
      publishedEvents.push(eventWithLink);
      localStorage.setItem("publishedEvents", JSON.stringify(publishedEvents));
      setShareLink(eventWithLink.shareLink);
    }

    setPopupMessage("🚀 Event Published to Dashboard!");
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Manage Events</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Event List</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 border rounded cursor-pointer ${
                        selectedEvent?.id === event.id ? "bg-blue-100" : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleSelect(event)}
                    >
                      <div className="flex items-center gap-3">
                        {event.photo ? (
                          <img
                            src={event.photo}
                            alt={event.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <span className="truncate">{event.name}</span>
                        <Trash2
                          className="w-4 h-4 text-gray-500 hover:text-red-500 ml-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(event.id);
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No events available.</p>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Event Details</h2>
              {selectedEvent ? (
                <div>
                  {isEditing ? (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Edit Event</h3>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Event Name</label>
                        <input
                          type="text"
                          value={selectedEvent.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className="w-full p-2 border rounded"
                          placeholder="Enter event name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Photo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="w-full p-2 border rounded"
                        />
                        {selectedEvent.photo && (
                          <img
                            src={selectedEvent.photo}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded mt-2"
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Location</label>
                          <input
                            type="text"
                            value={selectedEvent.location || ""}
                            onChange={(e) => handleChange("location", e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter location"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Date</label>
                          <input
                            type="date"
                            value={selectedEvent.date || ""}
                            onChange={(e) => handleChange("date", e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Time</label>
                          <input
                            type="time"
                            value={selectedEvent.time || ""}
                            onChange={(e) => handleChange("time", e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Duration</label>
                          <input
                            type="text"
                            value={selectedEvent.duration || ""}
                            onChange={(e) => handleChange("duration", e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="e.g., 2 hours"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Capacity</label>
                          <input
                            type="number"
                            value={selectedEvent.capacity || ""}
                            onChange={(e) => handleChange("capacity", e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter capacity"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Type</label>
                          <select
                            value={selectedEvent.type || ""}
                            onChange={(e) => handleChange("type", e.target.value)}
                            className="w-full p-2 border rounded"
                          >
                            <option value="">Select type</option>
                            <option value="Wedding">Wedding</option>
                            <option value="Birthday">Birthday</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Social">Social</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          value={selectedEvent.description || ""}
                          onChange={(e) => handleChange("description", e.target.value)}
                          className="w-full p-2 border rounded h-24"
                          placeholder="Enter event description"
                        />
                      </div>

                      <div className="flex gap-2 mt-6">
                        <button
                          onClick={handleConfirmEdit}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold">{selectedEvent.name}</h3>
                      {selectedEvent.photo && (
                        <img
                          src={selectedEvent.photo}
                          alt={selectedEvent.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <p><strong>Location:</strong> {selectedEvent.location}</p>
                      <p><strong>Date:</strong> {selectedEvent.date}</p>
                      <p><strong>Time:</strong> {selectedEvent.time}</p>
                      <p><strong>Duration:</strong> {selectedEvent.duration}</p>
                      <p><strong>Capacity:</strong> {selectedEvent.capacity}</p>
                      <p><strong>Type:</strong> {selectedEvent.type}</p>
                      <p><strong>Description:</strong> {selectedEvent.description}</p>
                      
                      <div className="mt-4 space-x-2">
                        <button
                          onClick={handlePublish}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                        >
                          Publish
                        </button>
                        <button
                          onClick={handleEditToggle}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                          Edit
                        </button>
                      </div>
                      
                      {shareLink && (
                        <div className="mt-4 p-4 bg-green-100 rounded">
                          <p className="text-green-800 font-semibold">Event Published!</p>
                          <p className="text-sm text-green-700 mt-1">Share this link:</p>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="text"
                              value={shareLink}
                              readOnly
                              className="flex-1 p-2 border rounded text-sm"
                            />
                            <button
                              onClick={() => navigator.clipboard.writeText(shareLink)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p>Select an event to view details.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-2xl shadow-xl px-10 py-6 text-center">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              {popupMessage}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvent;
