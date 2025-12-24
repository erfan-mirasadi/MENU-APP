"use client";
import GeneralForm from "@/app/admin/_components/settings/GeneralForm";
import LanguageSettings from "@/app/admin/_components/settings/LanguageSettings";

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full bg-dark-900 text-white overflow-hidden">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-text-dim text-sm mt-1">
          Manage restaurant details and languages
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <section>
            <GeneralForm />
          </section>

          {/* Divider */}
          <div className="border-t border-gray-800" />

          <section>
            <LanguageSettings />
          </section>
        </div>
      </div>
    </div>
  );
}
