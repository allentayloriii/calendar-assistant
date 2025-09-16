import { EventClickArg } from "@fullcalendar/core";
import { useState } from "react";

interface EventDetailsModalProps {
  event: EventClickArg;
  onClose: () => void;
  onUpdate: (
    eventId: string,
    updates: {
      title?: string;
      startISO?: string;
      endISO?: string;
      description?: string;
    }
  ) => void;
  onDelete: (eventId: string) => void;
}

export default function EventDetailsModal({
  event,
  onClose,
  onUpdate,
  onDelete,
}: EventDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(event.event.title);
  const [description, setDescription] = useState(
    event.event.extendedProps?.description || ""
  );
  const [startDate, setStartDate] = useState(
    event.event.start?.toISOString().split("T")[0] || ""
  );
  const [startTime, setStartTime] = useState(
    event.event.start?.toTimeString().slice(0, 5) || ""
  );
  const [endDate, setEndDate] = useState(
    event.event.end?.toISOString().split("T")[0] || ""
  );
  const [endTime, setEndTime] = useState(
    event.event.end?.toTimeString().slice(0, 5) || ""
  );

  const handleUpdate = () => {
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime =
      endDate && endTime ? new Date(`${endDate}T${endTime}`) : undefined;

    onUpdate(event.event.id, {
      title,
      startISO: startDateTime.toISOString(),
      endISO: endDateTime?.toISOString(),
      description: description || undefined,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this event?")) {
      onDelete(event.event.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isEditing ? "Edit Event" : "Event Details"}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <p className="text-gray-900">{event.event.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start
              </label>
              <p className="text-gray-900">
                {event.event.start?.toLocaleString()}
              </p>
            </div>
            {event.event.end && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End
                </label>
                <p className="text-gray-900">
                  {event.event.end.toLocaleString()}
                </p>
              </div>
            )}
            {event.event.extendedProps?.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="text-gray-900">
                  {event.event.extendedProps.description}
                </p>
              </div>
            )}
            {event.event.extendedProps?.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Created
                </label>
                <p className="text-sm text-gray-600">
                  {new Date(
                    event.event.extendedProps.createdAt
                  ).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
