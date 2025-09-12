import { useState } from "react";
import { DateSelectArg } from "@fullcalendar/core";

interface CreateEventModalProps {
  selectInfo: DateSelectArg;
  onClose: () => void;
  onCreateEvent: (eventData: {
    title: string;
    startISO: string;
    endISO?: string;
    description?: string;
  }) => void;
}

export function CreateEventModal({ selectInfo, onClose, onCreateEvent }: CreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const startDate = selectInfo.start;
    const endDate = selectInfo.end;

    let startISO: string;
    let endISO: string | undefined;

    if (selectInfo.allDay) {
      // All day event
      startISO = startDate.toISOString().split('T')[0];
      if (endDate && endDate.getTime() !== startDate.getTime()) {
        endISO = endDate.toISOString().split('T')[0];
      }
    } else {
      // Timed event
      if (startTime) {
        const [hours, minutes] = startTime.split(':');
        startDate.setHours(parseInt(hours), parseInt(minutes));
      }
      startISO = startDate.toISOString();

      if (endTime) {
        const endDateTime = new Date(startDate);
        const [hours, minutes] = endTime.split(':');
        endDateTime.setHours(parseInt(hours), parseInt(minutes));
        endISO = endDateTime.toISOString();
      }
    }

    onCreateEvent({
      title: title.trim(),
      startISO,
      endISO,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Create New Event</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event description"
            />
          </div>

          {!selectInfo.allDay && (
            <>
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <div className="text-sm text-gray-600">
            <p>Date: {selectInfo.start.toLocaleDateString()}</p>
            {selectInfo.allDay ? (
              <p>All day event</p>
            ) : (
              <p>Time slot: {selectInfo.start.toLocaleTimeString()} - {selectInfo.end.toLocaleTimeString()}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
