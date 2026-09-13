
"use client";

import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import { User, Save } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    target: "",
    targetrole: "",
    experiencelevel: "",
    github: "",
    linkedin: "",
  });

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
        });

        if (response.status === 404) {
          return;
        }

        const data = await response.json();

        setProfile({
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          target: data.target || "",
          targetrole: data.targetrole || "",
          experiencelevel: data.experiencelevel || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    getProfile();
  }, []);

  const saveProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        alert("Profile saved successfully!");
      } else {
        alert(data.error || "Failed to save profile");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  return (
    <main
      className={`${poppins.className} min-h-screen flex-1 bg-[#F3F3F1] p-8`}
    >
      <div className="rounded-[28px] border border-[#E2E2DF] bg-[#FAFAF9] p-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8E8E5] text-[#666]">
            <User size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-medium tracking-tight text-[#444]">
              Profile
            </h1>

            <p className="mt-1 text-sm text-[#999]">
              Manage your personal and career information.
            </p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="mt-8 space-y-5">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#666]">
              Name
            </label>

            <input
              type="text"
              className="w-full rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3.5 text-sm text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
              placeholder="Your name"
              value={profile.name}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  name: e.target.value,
                })
              }
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#666]">
              Email
            </label>

            <input
              type="email"
              className="w-full rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3.5 text-sm text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
              placeholder="Your email"
              value={profile.email}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  email: e.target.value,
                })
              }
            />
          </div>

          {/* Bio */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#666]">
              Bio
            </label>

            <textarea
              rows={4}
              className="w-full resize-none rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3.5 text-sm leading-6 text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
              placeholder="Tell us about yourself"
              value={profile.bio}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  bio: e.target.value,
                })
              }
            />
          </div>

          {/* Target Company */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#666]">
              Target Company
            </label>

            <input
              type="text"
              className="w-full rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3.5 text-sm text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
              placeholder="Target company"
              value={profile.target}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  target: e.target.value,
                })
              }
            />
          </div>

          {/* Target Role */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#666]">
              Target Role
            </label>

            <input
              type="text"
              className="w-full rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3.5 text-sm text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
              placeholder="Frontend Developer"
              value={profile.targetrole}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  targetrole: e.target.value,
                })
              }
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#666]">
              Experience Level
            </label>

            <input
              type="text"
              className="w-full rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3.5 text-sm text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
              placeholder="Fresher"
              value={profile.experiencelevel}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  experiencelevel: e.target.value,
                })
              }
            />
          </div>

          {/* GitHub */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#666]">
              GitHub
            </label>

            <input
              type="url"
              className="w-full rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3.5 text-sm text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
              placeholder="https://github.com/username"
              value={profile.github}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  github: e.target.value,
                })
              }
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#666]">
              LinkedIn
            </label>

            <input
              type="url"
              className="w-full rounded-xl border border-[#DCDCD9] bg-[#F5F5F3] p-3.5 text-sm text-[#555] outline-none transition placeholder:text-[#999] focus:border-[#BDBDBA]"
              placeholder="https://linkedin.com/in/username"
              value={profile.linkedin}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  linkedin: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={saveProfile}
          className="mt-7 flex items-center gap-2 rounded-xl border border-[#D5D5D2] bg-[#EDEDEB] px-6 py-3 text-sm font-medium text-[#555] transition hover:bg-[#E5E5E2]"
        >
          <Save size={16} />
          Save Profile
        </button>
      </div>
    </main>
  );
}

