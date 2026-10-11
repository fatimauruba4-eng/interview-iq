"use client";

import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import { Settings as SettingsIcon, Save } from "lucide-react";

const poppins = Poppins({
subsets: ["latin"],
weight: ["400", "500", "600"],
});

export default function SettingsPage() {
const [userName, setUserName] = useState("");
const [email, setEmail] = useState("");
const [preferredRole, setPreferredRole] = useState("");
const [loading, setLoading] = useState(false);

useEffect(() => {
async function getSettings() {
try {
const response = await fetch("/api/settings", {
cache: "no-store",
});


    if (!response.ok) return;

    const data = await response.json();

    setUserName(data.userName || "");
    setEmail(data.email || "");
    setPreferredRole(data.preferredRole || "");
  } catch (error) {
    console.error("Error loading settings:", error);
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
  console.error("Error saving settings:", error);

  alert(
    error instanceof Error
      ? error.message
      : "Something went wrong!"
  );
} finally {
  setLoading(false);
}


}

return (
<main
className={`${poppins.className} min-h-screen flex-1 bg-[#F3F3F1] p-8`}
> <div className="rounded-[28px] border border-[#E2E2DF] bg-[#FAFAF9] p-8"> <div className="flex items-center gap-4"> <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8E8E5] text-[#666]"> <SettingsIcon size={20} /> </div>


      <div>
        <h1 className="text-2xl font-medium tracking-tight text-[#444]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[#999]">
          Manage your account preferences and personal information.
        </p>
      </div>
    </div>

    <div className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="settings-username"
          className="mb-2 block text-sm font-medium text-[#666]"
        >
          Username
        </label>

        <input
          id="settings-username"
          type="text"
          autoComplete="username"
          className="w-full rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3.5 text-sm text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
          placeholder="Your username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="settings-email"
          className="mb-2 block text-sm font-medium text-[#666]"
        >
          Email
        </label>

        <input
          id="settings-email"
          type="email"
          autoComplete="email"
          className="w-full rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3.5 text-sm text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="settings-role"
          className="mb-2 block text-sm font-medium text-[#666]"
        >
          Preferred Role
        </label>

        <input
          id="settings-role"
          type="text"
          className="w-full rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3.5 text-sm text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
          placeholder="e.g. Frontend Developer"
          value={preferredRole}
          onChange={(e) => setPreferredRole(e.target.value)}
        />
      </div>
    </div>

    <button
      type="button"
      onClick={handleSave}
      disabled={loading}
      className="mt-7 flex items-center gap-2 rounded-xl border border-[#D5D5D2] bg-[#EDEDEB] px-6 py-3 text-sm font-medium text-[#555] transition hover:bg-[#E5E5E2] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Save size={16} />
      {loading ? "Saving..." : "Save Settings"}
    </button>
  </div>
</main>


);
}
