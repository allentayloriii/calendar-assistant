interface QueryResultsProps {
  results: any[];
  onClear: () => void;
}

export function QueryResults({ results, onClear }: QueryResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Search Results ({results.length})</h3>
        <button
          onClick={onClear}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-3">
        {results.map((event) => (
          <div key={event._id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{event.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(event.start).toLocaleDateString()} at{" "}
                  {new Date(event.start).toLocaleTimeString()}
                </p>
                {event.end && (
                  <p className="text-sm text-gray-600">
                    Until {new Date(event.end).toLocaleTimeString()}
                  </p>
                )}
                {event.description && (
                  <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Created {new Date(event.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
