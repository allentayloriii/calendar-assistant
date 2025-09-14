import { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { TrashIcon } from "@heroicons/react/20/solid";
import { useMutation, useQuery } from "convex/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import ConversationHistory, { ConversationEntry } from "./ConversationHistory";
import { CreateEventModal } from "./CreateEventModal";
import EventDetailsModal from "./EventDetailsModal";
import QueryResults from "./QueryResults";
import UserNLPInput from "./UserNLPInput";

export function TaskCalendar() {
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(
    null
  );
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [calendarView, setCalendarView] = useState<
    "multiMonth" | "month" | "week" | "day"
  >("month");

  const [calendarBlurred, setCalendarBlurred] = useState(false);

  const [lastResponse, setLastResponse] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<
    ConversationEntry[]
  >([]);

  const calendarRef = useRef<FullCalendar>(null);

  const events = useQuery(api.events.listEvents, {});
  const createEvent = useMutation(api.events.createEvent);
  const updateEvent = useMutation(api.events.updateEvent);
  const deleteEvent = useMutation(api.events.deleteEvent);

  // Query tasks based on NLP parameters
  const queryTasks = (parameters: any) => {
    let rangeStartISO: string | undefined;
    let rangeEndISO: string | undefined;
    if (parameters.dateRange) {
      const now = new Date();
      switch (parameters.dateRange) {
        case "today": {
          rangeStartISO = now.toISOString().split("T")[0];
          rangeEndISO = rangeStartISO;
          break;
        }
        case "tomorrow": {
          const tomorrow = new Date(now);
          tomorrow.setDate(now.getDate() + 1);
          rangeStartISO = tomorrow.toISOString().split("T")[0];
          rangeEndISO = rangeStartISO;
          break;
        }
        case "this week": {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          rangeStartISO = startOfWeek.toISOString().split("T")[0];
          rangeEndISO = endOfWeek.toISOString().split("T")[0];
          break;
        }
        case "next week": {
          const nextWeekStart = new Date(now);
          nextWeekStart.setDate(now.getDate() - now.getDay() + 7);
          const nextWeekEnd = new Date(nextWeekStart);
          nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
          rangeStartISO = nextWeekStart.toISOString().split("T")[0];
          rangeEndISO = nextWeekEnd.toISOString().split("T")[0];
          break;
        }
        default: {
          rangeStartISO = parameters.dateRange;
          rangeEndISO = parameters.dateRange;
        }
      }
    }

    // Fetch events using useQuery
    const filteredEvents = (events || []).filter((event) => {
      // Use event.end if available, otherwise event.start
      const eventEnd = event.end || event.start;
      const eventStart = event.start;
      // Date filtering
      if (rangeStartISO && eventEnd < rangeStartISO) return false;
      if (rangeEndISO && eventStart > rangeEndISO) return false;
      // Query string filtering
      if (parameters.query) {
        const queryLower = parameters.query.toLowerCase();
        if (
          !event.title.toLowerCase().includes(queryLower) &&
          !(
            event.description &&
            event.description.toLowerCase().includes(queryLower)
          )
        ) {
          return false;
        }
      }
      return true;
    });
    setQueryResults(filteredEvents);
    return filteredEvents;
  };

  // Convert Convex events to FullCalendar format
  const calendarEvents: EventInput[] = (events || []).map((event) => ({
    id: event._id,
    title: event.title,
    start: event.start,
    end: event.end || undefined,
    extendedProps: {
      description: event.description,
      createdAt: event.createdAt,
      createdBy: event.createdBy,
    },
  }));

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo);
  };

  const handleCreateEvent = async (eventData: {
    title: string;
    startISO: string;
    endISO?: string;
    description?: string;
  }) => {
    try {
      console.log(`Creating event with data:`, JSON.stringify(eventData));
      await createEvent(eventData);
      setSelectedDate(null);
      toast.success("Event created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };

  const handleUpdateEvent = async (
    eventId: string,
    updates: {
      title?: string;
      startISO?: string;
      endISO?: string;
      description?: string;
    }
  ) => {
    try {
      await updateEvent({
        eventId: eventId as any,
        ...updates,
      });
      setSelectedEvent(null);
      toast.success("Event updated successfully!");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent({
        eventId: eventId as any,
      });
      setSelectedEvent(null);
      toast.success("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleEventCreatedFromNL = () => {
    // Refresh calendar after event creation from natural language
    if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents();
    }
  };

  const handleViewChange = (view: "month" | "week" | "day" | "multiMonth") => {
    setCalendarView(view);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      switch (view) {
        case "multiMonth":
          calendarApi.changeView("multiMonthYear");
          break;
        case "month":
          calendarApi.changeView("dayGridMonth");
          break;
        case "week":
          calendarApi.changeView("timeGridWeek");
          break;
        case "day":
          calendarApi.changeView("timeGridDay");
          break;
        default:
          calendarApi.changeView("dayGridMonth");
          break;
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Controls and Calendar */}
      <div
        id="calendar-container"
        className="relative p-4 bg-white border rounded-lg shadow-sm"
        tabIndex={0}
      >
        {calendarBlurred && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
            <button
              className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded shadow-lg"
              onClick={() => {
                setCalendarBlurred(false);
                const el = document.getElementById("calendar-container");
                if (el) el.focus();
              }}
            >
              Back to Calendar
            </button>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Calendar View</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewChange("multiMonth")}
              className={`px-3 py-1 rounded text-sm ${
                calendarView === "multiMonth"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Multi-Month
            </button>
            <button
              onClick={() => handleViewChange("month")}
              className={`px-3 py-1 rounded text-sm ${
                calendarView === "month"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => handleViewChange("week")}
              className={`px-3 py-1 rounded text-sm ${
                calendarView === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => handleViewChange("day")}
              className={`px-3 py-1 rounded text-sm ${
                calendarView === "day"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Day
            </button>
          </div>
        </div>

        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            multiMonthPlugin,
          ]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "", // We handle view switching with our custom buttons
          }}
          initialView="dayGridMonth"
          editable={!calendarBlurred}
          selectable={!calendarBlurred}
          selectMirror={!calendarBlurred}
          dayMaxEvents={true}
          weekends={true}
          events={calendarEvents}
          select={calendarBlurred ? undefined : handleDateSelect}
          eventClick={calendarBlurred ? undefined : handleEventClick}
          height="auto"
          eventDisplay="block"
          eventBackgroundColor="#3b82f6"
          eventBorderColor="#2563eb"
          eventTextColor="#ffffff"
          nowIndicator={!calendarBlurred}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
        />
      </div>

      {/* Create Event Modal */}
      {selectedDate && (
        <CreateEventModal
          selectInfo={selectedDate}
          onClose={() => setSelectedDate(null)}
          onCreateEvent={(eventData) => {
            void handleCreateEvent(eventData);
          }}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={(eventId, updates) => {
            void handleUpdateEvent(eventId, updates);
          }}
          onDelete={(eventId) => {
            void handleDeleteEvent(eventId);
          }}
        />
      )}

      {/* User NLP Input - floating at bottom */}
      <div className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none bottom-8">
        <div className="w-full max-w-2xl bg-white shadow-2xl pointer-events-auto rounded-xl">
          <UserNLPInput
            onQueryResults={(parameters) => {
              setCalendarBlurred(true); // Blur calendar when NLP input is submitted
              queryTasks(parameters);
            }}
            onEventCreated={handleEventCreatedFromNL}
            setConversationHistory={setConversationHistory}
            setLastResponse={setLastResponse}
            lastResponse={lastResponse}
          />
        </div>
      </div>

      {(conversationHistory.length > 0 || queryResults.length > 0) && (
        <div className="flex-1 flex-direction-column gap-4 conversation-query-container min-h-[500px]">
          <ConversationHistory
            conversationHistory={conversationHistory}
            lastResponse={lastResponse}
          />
          <QueryResults
            results={queryResults}
            onClear={() => setQueryResults([])}
          />
          <div className="flex items-center justify-between mt-2">
            {conversationHistory.length > 0 && (
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setTimeout(() => {
                    setConversationHistory([]);
                    setLastResponse("");
                  }, 1000);
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Clear History"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
