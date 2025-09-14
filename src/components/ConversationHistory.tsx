export interface ConversationEntry {
  user: string;
  assistant: string;
  timestamp: Date;
}

interface ConversationHistoryProps {
  conversationHistory: ConversationEntry[];
  lastResponse: string;
  clearHistory: () => void;
}

export default function ConversationHistory({
  conversationHistory,
  lastResponse,
  clearHistory,
}: ConversationHistoryProps) {
  if (conversationHistory.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 space-y-2 overflow-y-auto max-h-40">
      <div className="flex items-center justify-between mb-4">
        {conversationHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear History
          </button>
        )}
      </div>
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
      {lastResponse && (
        <div className="p-3 mt-4 border border-blue-200 rounded-md bg-blue-50">
          <p className="text-blue-800">{lastResponse}</p>
        </div>
      )}
    </div>
  );
}
