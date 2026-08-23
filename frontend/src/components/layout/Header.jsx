import { Search, Bell, ChevronDown } from "lucide-react";

export default function Header({ title, subtitle }) {
  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white">
      <div>
        <h2 className="font-semibold text-gray-900">
          {title} <span className="font-normal text-gray-400">{subtitle}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search VIN, vehicle or component."
            className="pl-9 pr-4 py-2 w-72 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-50">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        <button className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            DW
          </div>
          <span className="text-sm font-medium text-gray-900">Dana Whitfield</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </header>
  );
}