import { useAction, useMutation } from "convex/react";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { ConversationEntry } from "./ConversationHistory";

interface UserNLPInputProps {
  onQueryResults: (parameters: any) => void;
  onEventCreated: () => void;
  setConversationHistory: Dispatch<SetStateAction<ConversationEntry[]>>;
  setLastResponse: Dispatch<SetStateAction<string>>;
  lastResponse: string;
}

export default function UserNLPInput({
  onQueryResults,
  onEventCreated,
  setConversationHistory,
  setLastResponse,
  lastResponse,
}: UserNLPInputProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const processNaturalLanguage = useAction(api.nlp.processNaturalLanguage);
  const createEvent = useMutation(api.events.createEvent);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userInput = input.trim();
    setIsProcessing(true);
    setInput("");

    try {
      // Process with NLP
      const nlpResult = await processNaturalLanguage({
        text: userInput,
      });

      console.log("NLP Result:", nlpResult);

      // Handle different intents
      switch (nlpResult.intent) {
        case "CREATE_TASK": {
          await handleCreateTask(nlpResult.parameters, userInput);
          break;
        }
        case "QUERY_TASKS": {
          onQueryResults(nlpResult.parameters);
          setLastResponse(
            nlpResult.response ||
              "Here are the tasks matching your query. Check the calendar above."
          );
          break;
        }

        case "UPDATE_TASK": {
          setLastResponse(
            "Task updating is not yet implemented. Please create a new task or search for existing ones."
          );
          break;
        }
        case "DELETE_TASK": {
          setLastResponse(
            "Task deletion is not yet implemented. Please use the calendar interface to manage tasks."
          );
          break;
        }
        default: {
          setLastResponse(
            nlpResult.response ||
              "I'm not sure what you want to do. Try asking me to create a task or search for existing ones."
          );
          break;
        }
      }

      // Add to conversation history
      setConversationHistory((prev) => [
        ...prev,
        {
          user: userInput,
          assistant: nlpResult.response || lastResponse,
          timestamp: new Date(),
        },
      ]);
      // Scroll to just beyond the bottom of the calendar after submit
      setTimeout(() => {
        const calendarEl = document.querySelector("#calendar-container");
        if (calendarEl) {
          const rect = calendarEl.getBoundingClientRect();
          const scrollY = window.scrollY || window.pageYOffset;
          const targetY = rect.bottom + scrollY + 48;
          window.scrollTo({
            top: targetY,
            behavior: "smooth",
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error processing natural language input:", error);
      setLastResponse(
        "Sorry, I encountered an error processing your request. Please try again."
      );
      toast.error("Failed to process your request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateTask = async (parameters: any, originalInput: string) => {
    try {
      const title = parameters.title || "New Task";
      let startDate = new Date();

      // Parse date
      if (parameters.date) {
        // If only a date is provided (YYYY-MM-DD), set local time to now or to 00:00
        const dateParts = parameters.date.split("-");
        if (dateParts.length === 3) {
          // Use local time for today
          const today = new Date();
          startDate = new Date(
            Number(dateParts[0]),
            Number(dateParts[1]) - 1,
            Number(dateParts[2]),
            today.getHours(),
            today.getMinutes(),
            today.getSeconds()
          );
        } else {
          startDate = new Date(parameters.date);
        }
      }

      // Parse time
      if (parameters.time) {
        const [hours, minutes] = parameters.time.split(":");
        startDate.setHours(parseInt(hours), parseInt(minutes || "0"), 0, 0);
      }

      // Calculate end time if duration is provided
      let endDate: Date | undefined;
      if (parameters.duration) {
        endDate = new Date(startDate);
        endDate.setMinutes(
          endDate.getMinutes() + parseInt(parameters.duration)
        );
      }

      await createEvent({
        title,
        startISO: startDate.toISOString(),
        endISO: endDate?.toISOString(),
        description:
          parameters.description ||
          `Created via natural language: "${originalInput}"`,
      });

      onEventCreated();
      toast.success(`Created task: ${title}`);
      setLastResponse(
        `Successfully created "${title}" for ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}.`
      );
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
      setLastResponse(
        "Sorry, I couldn't create the task. Please try again with more specific details."
      );
    }
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try: 'Show me my tasks for today'"
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
    </div>
  );
}
