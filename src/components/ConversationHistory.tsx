export interface ConversationEntry {
  user: string;
  assistant: string;
  timestamp: Date;
}

interface ConversationHistoryProps {
  conversationHistory: ConversationEntry[];
  lastResponse: string;
}

export default function ConversationHistory({
  conversationHistory,
  lastResponse,
}: ConversationHistoryProps) {
  if (conversationHistory.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 space-y-2">
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
