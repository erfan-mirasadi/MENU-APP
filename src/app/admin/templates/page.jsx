// src/app/admin/templates/page.jsx
"use client";

export default function TemplatesPage() {
  return (
    <div className="flex flex-col h-full bg-dark-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-2">Templates</h1>
      <p className="text-text-dim mb-8">
        Choose a design for your digital menu.
      </p>

      {/* Temporary Placeholder for Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Modern Dark Template (Selected) */}
        <div className="border-2 border-primary rounded-xl p-4 bg-dark-800">
          <div className="h-40 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
            Preview Image
          </div>
          <h3 className="font-bold text-lg">Modern Dark</h3>
          <p className="text-sm text-gray-400 mb-4">
            Best for cafes and night restaurants.
          </p>
          <button className="w-full bg-primary py-2 rounded-lg text-white font-medium">
            Active
          </button>
        </div>

        {/* Minimal Light Template */}
        <div className="border border-gray-700 rounded-xl p-4 bg-dark-800 opacity-60">
          <div className="h-40 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
            Preview Image
          </div>
          <h3 className="font-bold text-lg">Minimal Light</h3>
          <p className="text-sm text-gray-400 mb-4">Clean and bright design.</p>
          <button className="w-full border border-gray-600 py-2 rounded-lg text-white font-medium hover:bg-gray-700">
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
