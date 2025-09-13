import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface EnhancedNaturalLanguageInputProps {
  // ...existing code...
  onEventCreated: () => void;
}

export function EnhancedNaturalLanguageInput({
  onEventCreated,
}: EnhancedNaturalLanguageInputProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<
    Array<{
      user: string;
      assistant: string;
      timestamp: Date;
    }>
  >([]);

  const processNaturalLanguage = useAction(api.nlp.processNaturalLanguage);
  const createEvent = useMutation(api.events.createEvent);
  // ...existing code...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userInput = input.trim();
    setIsProcessing(true);
    setInput("");

    try {
      // Process with enhanced NLP
      const nlpResult = await processNaturalLanguage({
        text: userInput,
      });

      console.log("NLP Result:", nlpResult);

      // Handle different intents
      switch (nlpResult.intent) {
        case "CREATE_TASK":
          await handleCreateTask(nlpResult.parameters, userInput);
          break;

        case "QUERY_TASKS":
          setLastResponse("Task querying is handled by the calendar view.");
          break;

        case "UPDATE_TASK":
          setLastResponse(
            "Task updating is not yet implemented. Please create a new task or search for existing ones."
          );
          break;

        case "DELETE_TASK":
          setLastResponse(
            "Task deletion is not yet implemented. Please use the calendar interface to manage tasks."
          );
          break;

        default:
          setLastResponse(
            nlpResult.response ||
              "I'm not sure what you want to do. Try asking me to create a task or search for existing ones."
          );
          break;
      }

      // Add to conversation history
      setConversationHistory((prev) =>
        [
          ...prev,
          {
            user: userInput,
            assistant: nlpResult.response || lastResponse,
            timestamp: new Date(),
          },
        ].slice(-5)
      ); // Keep last 5 interactions
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

  const clearHistory = () => {
    setConversationHistory([]);
    setLastResponse("");
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        {/* <h3 className="text-lg font-semibold">AI Task Assistant</h3> */}
        {conversationHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="mb-4 space-y-2 overflow-y-auto max-h-40">
          {conversationHistory.map((interaction, index) => (
            <div key={index} className="text-sm">
              <div className="font-medium text-blue-600">
                You: {interaction.user}
              </div>
              <div className="ml-4 text-gray-700">
                Assistant: {interaction.assistant}
              </div>
            </div>
          ))}
        </div>
      )}

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
            placeholder="Try: 'Create a meeting tomorrow at 2pm' or 'Show me my tasks for today'"
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

      {/* <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">Example commands:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>"Create a meeting tomorrow at 2pm for 1 hour"</li>
          <li>"Schedule dentist appointment next Friday at 10am"</li>
          <li>"Show me my tasks for today"</li>
          <li>"Find all meetings this week"</li>
          <li>"What do I have tomorrow morning?"</li>
          <li>"Create a workout session at 6am daily"</li>
        </ul>
      </div> */}
    </div>
  );
}
