export default function FleetInsights({ insights }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">
          Fleet Insights
        </h3>

        <p className="text-sm text-gray-500">
          Patterns identified across your fleet
        </p>
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <p className="text-sm text-gray-500">
            No significant fleet patterns detected yet.
          </p>
        ) : (
          insights.map((insight, index) => (
            <div
              key={`${insight.title}-${index}`}
              className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-medium text-gray-900">
                  {insight.title}
                </h4>

                {insight.stat && (
                  <span className="shrink-0 text-xs font-medium text-indigo-600">
                    {insight.stat}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {insight.detail}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}