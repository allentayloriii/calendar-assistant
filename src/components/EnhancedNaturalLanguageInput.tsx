import { useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface EnhancedNaturalLanguageInputProps {
  onQueryResults: (results: any[]) => void;
  onEventCreated: () => void;
}

export function EnhancedNaturalLanguageInput({ onQueryResults, onEventCreated }: EnhancedNaturalLanguageInputProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<Array<{
    user: string;
    assistant: string;
    timestamp: Date;
  }>>([]);

  const processNaturalLanguage = useAction(api.nlp.processNaturalLanguage);
  const createEvent = useMutation(api.events.createEvent);

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
        case 'CREATE_TASK':
          await handleCreateTask(nlpResult.parameters, userInput);
          break;

        case 'QUERY_TASKS':
          await handleQueryTasks(nlpResult.parameters);
          break;

        case 'UPDATE_TASK':
          setLastResponse("Task updating is not yet implemented. Please create a new task or search for existing ones.");
          break;

        case 'DELETE_TASK':
          setLastResponse("Task deletion is not yet implemented. Please use the calendar interface to manage tasks.");
          break;

        default:
          setLastResponse(nlpResult.response || "I'm not sure what you want to do. Try asking me to create a task or search for existing ones.");
          break;
      }

      // Add to conversation history
      setConversationHistory(prev => [...prev, {
        user: userInput,
        assistant: nlpResult.response || lastResponse,
        timestamp: new Date()
      }].slice(-5)); // Keep last 5 interactions

    } catch (error) {
      console.error("Error processing natural language input:", error);
      setLastResponse("Sorry, I encountered an error processing your request. Please try again.");
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
        startDate = new Date(parameters.date);
      }

      // Parse time
      if (parameters.time) {
        const [hours, minutes] = parameters.time.split(':');
        startDate.setHours(parseInt(hours), parseInt(minutes || '0'));
      }

      // Calculate end time if duration is provided
      let endDate: Date | undefined;
      if (parameters.duration) {
        endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + parseInt(parameters.duration));
      }

      await createEvent({
        title,
        startISO: startDate.toISOString(),
        endISO: endDate?.toISOString(),
        description: parameters.description || `Created via natural language: "${originalInput}"`,
      });

      onEventCreated();
      toast.success(`Created task: ${title}`);
      setLastResponse(`Successfully created "${title}" for ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}.`);

    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
      setLastResponse("Sorry, I couldn't create the task. Please try again with more specific details.");
    }
  };

  const handleQueryTasks = async (parameters: any) => {
    try {
      // For now, just show a message that we're searching
      // The actual search will be handled by the parent component
      setLastResponse("Searching for your tasks...");
      
      // Trigger a search in the parent component
      onQueryResults([]);

    } catch (error) {
      console.error("Error querying tasks:", error);
      setLastResponse("Sorry, I couldn't search for tasks. Please try again.");
    }
  };

  const clearHistory = () => {
    setConversationHistory([]);
    setLastResponse("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">AI Task Assistant</h3>
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
        <div className="mb-4 space-y-2 max-h-40 overflow-y-auto">
          {conversationHistory.map((interaction, index) => (
            <div key={index} className="text-sm">
              <div className="text-blue-600 font-medium">You: {interaction.user}</div>
              <div className="text-gray-700 ml-4">Assistant: {interaction.assistant}</div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? "Processing..." : "Send"}
          </button>
        </div>
      </form>

      {lastResponse && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800">{lastResponse}</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">Example commands:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>"Create a meeting tomorrow at 2pm for 1 hour"</li>
          <li>"Schedule dentist appointment next Friday at 10am"</li>
          <li>"Show me my tasks for today"</li>
          <li>"Find all meetings this week"</li>
          <li>"What do I have tomorrow morning?"</li>
          <li>"Create a workout session at 6am daily"</li>
        </ul>
      </div>
    </div>
  );
}
