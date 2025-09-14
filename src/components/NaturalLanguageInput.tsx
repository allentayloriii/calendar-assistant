import { useState, FormEvent, Dispatch, SetStateAction } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { ConversationEntry } from "./ConversationHistory";

interface NaturalLanguageInputProps {
  onQueryResults: (results: any[]) => void;
  onEventCreated: () => void;
  setConversationHistory: Dispatch<SetStateAction<ConversationEntry[]>>;
  setLastResponse: Dispatch<SetStateAction<string>>;
  lastResponse: string;
}

export function NaturalLanguageInput({
  onQueryResults,
  onEventCreated,
}: NaturalLanguageInputProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>("");

  const dialogflowDetectIntent = useAction(
    api.dialogflow.dialogflowDetectIntent
  );
  const createEvent = useMutation(api.events.createEvent);
  const queryEventsByText = useQuery(
    api.events.queryEventsByText,
    input.trim() ? { queryText: input.trim() } : "skip"
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    setLastResponse("");

    try {
      // First, try to detect intent with Dialogflow
      const dialogflowResponse = await dialogflowDetectIntent({
        text: input.trim(),
      });

      console.log("Dialogflow response:", dialogflowResponse);

      // Handle different intents
      switch (dialogflowResponse.intent.toLowerCase()) {
        case "querytasks":
        case "query.tasks":
          // Query existing events
          if (queryEventsByText) {
            onQueryResults(queryEventsByText);
            setLastResponse(
              `Found ${queryEventsByText.length} matching events.`
            );
          } else {
            setLastResponse("Searching for matching events...");
          }
          break;

        case "createtask":
        case "create.task":
          // Extract parameters and create event
          await handleCreateTaskIntent(dialogflowResponse.parameters);
          break;

        default:
          // Fallback - show Dialogflow response or try simple query
          if (dialogflowResponse.fulfillmentText) {
            setLastResponse(dialogflowResponse.fulfillmentText);
          } else {
            // Try simple text search as fallback
            if (queryEventsByText) {
              onQueryResults(queryEventsByText);
              setLastResponse(
                `Found ${queryEventsByText.length} matching events for "${input}".`
              );
            }
          }
          break;
      }
    } catch (error) {
      console.error("Error processing natural language input:", error);

      // Fallback to simple text search
      if (queryEventsByText) {
        onQueryResults(queryEventsByText);
        setLastResponse(
          `Found ${queryEventsByText.length} matching events for "${input}".`
        );
      } else {
        setLastResponse(
          "Sorry, I couldn't process your request. Please try again."
        );
      }
    } finally {
      setIsProcessing(false);
      setInput("");
    }
  };

  const handleCreateTaskIntent = async (parameters: any) => {
    try {
      // Improved extraction for more Dialogflow entities
      const title =
        parameters.task_title ||
        parameters["task-title"] ||
        parameters.title ||
        "New Task";
      const dateParam =
        parameters.date || parameters["date-time"] || parameters.start_date;
      const timeParam =
        parameters.time || parameters["date-time"] || parameters.start_time;
      const durationParam = parameters.duration;
      const location = parameters.location || parameters.place || "";
      const attendees = parameters.attendees || parameters.participants || [];
      const recurrence = parameters.recurrence || parameters.repeat || "";
      const notes = parameters.notes || parameters.description || "";

      // Parse date and time
      let startDate = new Date();
      if (dateParam) {
        if (typeof dateParam === "string") {
          startDate = new Date(dateParam);
        } else if (dateParam.date_time) {
          startDate = new Date(dateParam.date_time);
        }
      }
      if (timeParam && typeof timeParam === "string") {
        const timeMatch = timeParam.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          startDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]));
        }
      }

      // Calculate end time if duration is provided
      let endDate: Date | undefined;
      if (durationParam) {
        endDate = new Date(startDate);
        if (typeof durationParam === "number") {
          endDate.setHours(endDate.getHours() + durationParam);
        } else if (durationParam.amount && durationParam.unit) {
          const amount = durationParam.amount;
          switch (durationParam.unit) {
            case "h":
            case "hour":
            case "hours":
              endDate.setHours(endDate.getHours() + amount);
              break;
            case "m":
            case "min":
            case "minute":
            case "minutes":
              endDate.setMinutes(endDate.getMinutes() + amount);
              break;
            default:
              endDate.setHours(endDate.getHours() + 1); // Default 1 hour
          }
        }
      }

      // Build description with extra info
      let description = `Created via natural language: "${input}"`;
      if (location) description += `\nLocation: ${location}`;
      if (attendees.length > 0)
        description += `\nAttendees: ${attendees.join(", ")}`;
      if (recurrence) description += `\nRecurrence: ${recurrence}`;
      if (notes) description += `\nNotes: ${notes}`;

      await createEvent({
        title,
        startISO: startDate.toISOString(),
        endISO: endDate?.toISOString(),
        description,
      });

      onEventCreated();
      toast.success(`Created event: ${title}`);
      setLastResponse(
        `Successfully created event "${title}" for ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}.`
      );
    } catch (error) {
      console.error("Error creating event from intent:", error);
      toast.error("Failed to create event");
      setLastResponse(
        "Sorry, I couldn't create the event. Please try again with more specific details."
      );
    }
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Natural Language Commands</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try: 'Create a meeting tomorrow at 2pm' or 'Show me my tasks for this week'"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Send"}
          </button>
        </div>
      </form>

      {lastResponse && (
        <div className="p-3 mt-4 border border-blue-200 rounded-md bg-blue-50">
          <p className="text-blue-800">{lastResponse}</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">Example commands:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>"Create a meeting tomorrow at 2pm"</li>
          <li>"Schedule dentist appointment next Friday at 10am"</li>
          <li>"Show me my tasks for this week"</li>
          <li>"Find meetings with John"</li>
          <li>"What do I have on Monday?"</li>
        </ul>
      </div>
    </div>
  );
}
