const accentBar = {
  purple: "bg-purple-500",
  red: "bg-red-500",
  teal: "bg-teal-500",
};

export default function ShortcutCard({ icon: Icon, accent = "purple", title, description, onOpen }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
      <div className={`h-1 ${accentBar[accent]}`} />
      <div className="p-5 flex-1 flex flex-col">
        <Icon className="w-5 h-5 text-gray-700 mb-4" />
        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
        <p className="text-sm text-gray-500 flex-1">{description}</p>
        <button onClick={onOpen} className="mt-4 text-sm font-medium text-indigo-600 hover:underline text-left">
          OPEN &gt;
        </button>
      </div>
    </div>
  );
}
