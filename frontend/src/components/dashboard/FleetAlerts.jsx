import RiskBadge from "./RiskBadge";

export default function FleetAlerts({ alerts }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">
          Fleet Alerts
        </h3>

        <p className="text-sm text-gray-500">
          Issues requiring immediate attention
        </p>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500">
            No critical alerts at this time.
          </p>
        ) : (
          alerts.map((alert, index) => (
            <div
              key={`${alert.vin}-${alert.component}-${index}`}
              className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-medium text-gray-900">
                  {alert.title}
                </h4>

                <RiskBadge level={alert.risk} />
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {alert.detail}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                {alert.vin} · {alert.component}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}