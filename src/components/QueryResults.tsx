interface QueryResultsProps {
  results: any[];
  onClear: () => void;
}

export function QueryResults({ results, onClear }: QueryResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Search Results ({results.length})
        </h3>
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      </div>

      <div className="space-y-3">
        {results.map((event) => (
          <div
            key={event._id}
            className="p-3 border border-gray-200 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{event.title}</h4>
                <p className="mt-1 text-sm text-gray-600">
                  {new Date(event.start).toLocaleDateString()} at{" "}
                  {new Date(event.start).toLocaleTimeString()}
                </p>
                {event.end && (
                  <p className="text-sm text-gray-600">
                    Until {new Date(event.end).toLocaleTimeString()}
                  </p>
                )}
                {event.description && (
                  <p className="mt-2 text-sm text-gray-700">
                    {event.description}
                  </p>
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
