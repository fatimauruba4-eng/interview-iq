
"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [preferredRole, setPreferredRole] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getSettings() {
      try {
        const response = await fetch("/api/settings");

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setUserName(data.userName || "");
        setEmail(data.email || "");
        setPreferredRole(data.preferredRole || "");
      } catch (error) {
        console.log(error);
      }
    }

    getSettings();
  }, []);

  async function handleSave() {
    setLoading(true);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName,
          email,
          preferredRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      alert("Settings saved successfully!");
    } catch (error) {
      console.log(error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex-1 bg-[#F3F3F1] p-8">
      <div className="rounded-[28px] border border-[#E2E2DF] bg-[#FAFAF9] p-8">
        <h1 className="text-2xl font-medium text-[#444]">
          Settings
        </h1>

        <p className="mt-2 text-gray-500">
          Update your account settings.
        </p>

        <div className="mt-8 rounded-xl border border-[#E2E2DF] bg-white p-6">
          <label className="mb-2 block font-bold text-[#555]">
            Username
          </label>

          <input
            type="text"
            className="w-full rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3 outline-none focus:border-[#BDBDBA]"
            placeholder="Enter your username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />

          <label className="mb-2 mt-6 block font-bold text-[#555]">
            Email
          </label>

          <input
            type="email"
            className="w-full rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3 outline-none focus:border-[#BDBDBA]"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="mb-2 mt-6 block font-bold text-[#555]">
            Preferred Role
          </label>

          <input
            type="text"
            className="w-full rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3 outline-none focus:border-[#BDBDBA]"
            placeholder="Enter your preferred role"
            value={preferredRole}
            onChange={(e) => setPreferredRole(e.target.value)}
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-black py-3 text-white transition hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </main>
  );
}

