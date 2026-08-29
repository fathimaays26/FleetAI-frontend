import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

export default function SelectFailedPartStep({ onSelectPart }) {
  const [activeCategory, setActiveCategory] = useState("All categories");
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/parts`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load parts");
        return response.json();
      })
      .then((data) =>
        setParts(
          Object.entries(data || {}).flatMap(([category, items]) =>
            (Array.isArray(items) ? items : []).map((item) => ({
              ...item,
              category,
            })),
          ),
        ),
      )
      .catch((requestError) => {
        if (requestError.name !== "AbortError")
          setError(
            "Unable to load parts. Please make sure the backend is running.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const visibleParts =
    activeCategory === "All categories"
      ? parts
      : parts.filter((p) => p.category === activeCategory);
  const categories = [
    "All categories",
    ...new Set(parts.map((part) => part.category)),
  ];

  if (loading)
    return <div className="py-10 text-sm text-gray-500">Loading parts...</div>;
  if (error) return <div className="py-10 text-sm text-red-600">{error}</div>;
  if (!parts.length)
    return (
      <div className="py-10 text-sm text-gray-500">No parts available.</div>
    );

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Which part failed?
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Select the component to analyze — VoltIQ pulls its fleet-wide failure
        history and builds a predictive rule from it.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              activeCategory === cat
                ? "bg-purple-50 text-purple-600 border-purple-200 font-medium"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {visibleParts.map((part) => (
          <button
            key={part.part_code}
            onClick={() => onSelectPart(part)}
            className="text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 hover:shadow-sm transition-all"
          >
            <Zap className="w-4 h-4 text-purple-500 mb-2" />
            <div className="font-medium text-gray-900 text-sm">
              {part.description}
            </div>
            <div className="text-xs text-gray-400">{part.category}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
