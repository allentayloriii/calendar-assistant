import { FormEvent, useState } from "react";
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

export function CreateEventModal({
  selectInfo,
  onClose,
  onCreateEvent,
}: CreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const startDate = selectInfo.start;
    const endDate = selectInfo.end;

    let startISO: string;
    let endISO: string | undefined;

    if (selectInfo.allDay) {
      // All day event
      startISO = startDate.toISOString().split("T")[0];
      if (endDate && endDate.getTime() !== startDate.getTime()) {
        endISO = endDate.toISOString().split("T")[0];
      }
    } else {
      // Timed event
      if (startTime) {
        const [hours, minutes] = startTime.split(":");
        startDate.setHours(parseInt(hours), parseInt(minutes));
      }
      startISO = startDate.toISOString();

      if (endTime) {
        const endDateTime = new Date(startDate);
        const [hours, minutes] = endTime.split(":");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
        <h3 className="mb-4 text-lg font-semibold">Create New Event</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="description"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
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
                <label
                  htmlFor="startTime"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
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
                <label
                  htmlFor="endTime"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
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
              <p>
                Time slot: {selectInfo.start.toLocaleTimeString()} -{" "}
                {selectInfo.end.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
