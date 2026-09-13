"use client";

import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Search,
  ArrowUpRight,
  Clock,
  X,
  FileText,
  MessageSquare,
  BarChart3,
  Sparkles,
  Settings,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type Interview = {
  role: string;
  score: string | number;
  created_at: string;
};

type Schedule = {
  id: number;
  role: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
};

const avatars = [
  "https://i.pravatar.cc/100?img=47",
  "https://i.pravatar.cc/100?img=49",
  "https://i.pravatar.cc/100?img=44",
  "https://i.pravatar.cc/100?img=45",
];

const sidebarFeatures = [
  {
    name: "Resume Analyzer",
    description: "Analyze your resume with AI",
    icon: FileText,
  },
  {
    name: "AI Interview",
    description: "Practice interview questions",
    icon: MessageSquare,
  },
  {
    name: "Interview Schedule",
    description: "Schedule and manage interviews",
    icon: CalendarDays,
  },
  {
    name: "Recent Interviews",
    description: "View completed interviews",
    icon: BookOpen,
  },
  {
    name: "Interview Progress",
    description: "Track your interview progress",
    icon: BarChart3,
  },
  {
    name: "Interview Skills",
    description: "Improve your interview skills",
    icon: Sparkles,
  },
  {
    name: "Settings",
    description: "Manage your account settings",
    icon: Settings,
  },
];

function UserAvatar() {
  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#ead5c1]">
      <img
        src="https://i.pravatar.cc/100?img=47"
        alt="User avatar"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function MiniAvatarStack() {
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {avatars.map((avatar, index) => (
          <div
            key={index}
            className="h-7 w-7 overflow-hidden rounded-full border-2 border-white bg-[#ece7df]"
          >
            <img
              src={avatar}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
      <span className="ml-1 rounded-full bg-white px-1.5 py-1 text-[10px] font-semibold">
        +6
      </span>
    </div>
  );
}

export default function DashboardRightPanel() {
  const router = useRouter();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    preferredRole: "",
  });

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedInterview, setSelectedInterview] =
    useState<Interview | null>(null);
  const [role, setRole] = useState("");
  const [time, setTime] = useState("10:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function getDashboardData() {
      try {
        const profileResponse = await fetch("/api/settings");

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();

          setProfile({
            username: profileData.userName || "",
            email: profileData.email || "",
            preferredRole: profileData.preferredRole || "",
          });
        }

        const interviewResponse = await fetch(
          "/api/dashboard-right-panel"
        );

        if (interviewResponse.ok) {
          const interviewData = await interviewResponse.json();
          setInterviews(interviewData.interviews || []);
        }

        const scheduleResponse = await fetch(
          "/api/interview-schedule"
        );

        if (scheduleResponse.ok) {
          const scheduleData = await scheduleResponse.json();
          setSchedules(scheduleData.schedules || []);
        }
      } catch (error) {
        console.log(error);
      }
    }

    getDashboardData();
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
  });

  const firstDay = new Date(year, month, 1).getDay();

  const mondayFirstOffset =
    firstDay === 0 ? 6 : firstDay - 1;

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const calendarDays = Array.from(
    {
      length: mondayFirstOffset + daysInMonth,
    },
    (_, index) => {
      if (index < mondayFirstOffset) {
        return null;
      }

      return index - mondayFirstOffset + 1;
    }
  );

  const formatDate = (day: number) => {
    const date = new Date(year, month, day);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  const scheduledDates = useMemo(
    () =>
      schedules.map(
        (schedule) => schedule.scheduled_date
      ),
    [schedules]
  );

  const selectedSchedule = useMemo(
    () =>
      schedules.find(
        (schedule) =>
          schedule.scheduled_date === selectedDate
      ),
    [schedules, selectedDate]
  );

  const suggestionResults = useMemo(() => {
    const query = searchInput.trim().toLowerCase();

    const matchingSchedules = schedules
      .filter((schedule) => {
        if (!query) return true;

        const searchableText = [
          schedule.role,
          schedule.scheduled_date,
          schedule.scheduled_time,
          schedule.status,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .slice(0, 5);

    const matchingInterviews = interviews
      .filter((interview) => {
        if (!query) return true;

        const searchableText = [
          interview.role,
          interview.score,
          interview.created_at,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .slice(0, 5);

    const matchingFeatures = sidebarFeatures
      .filter((feature) => {
        if (!query) return true;

        const searchableText = [
          feature.name,
          feature.description,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .slice(0, 7);

    return {
      schedules: matchingSchedules,
      interviews: matchingInterviews,
      features: matchingFeatures,
    };
  }, [searchInput, schedules, interviews]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return {
        schedules: [],
        interviews: [],
        features: [],
      };
    }

    const matchingSchedules = schedules.filter(
      (schedule) => {
        const searchableText = [
          schedule.role,
          schedule.scheduled_date,
          schedule.scheduled_time,
          schedule.status,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      }
    );

    const matchingInterviews = interviews.filter(
      (interview) => {
        const searchableText = [
          interview.role,
          interview.score,
          interview.created_at,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      }
    );

    const matchingFeatures = sidebarFeatures.filter(
      (feature) => {
        const searchableText = [
          feature.name,
          feature.description,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      }
    );

    return {
      schedules: matchingSchedules,
      interviews: matchingInterviews,
      features: matchingFeatures,
    };
  }, [searchQuery, schedules, interviews]);

  const hasSearch = searchQuery.trim().length > 0;

  const totalSearchResults =
    searchResults.schedules.length +
    searchResults.interviews.length +
    searchResults.features.length;

  const hasSuggestionInput =
    searchInput.trim().length > 0;

  const totalSuggestions =
    suggestionResults.schedules.length +
    suggestionResults.interviews.length +
    suggestionResults.features.length;

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(year, month - 1, 1)
    );
    setSelectedDate("");
    setSelectedInterview(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(year, month + 1, 1)
    );
    setSelectedDate("");
    setSelectedInterview(null);
  };

  const handleDateClick = (day: number) => {
    const date = formatDate(day);

    setSelectedDate(date);
    setSelectedInterview(null);

    const existingSchedule = schedules.find(
      (schedule) =>
        schedule.scheduled_date === date
    );

    if (existingSchedule) {
      setRole(existingSchedule.role);
      setTime(
        existingSchedule.scheduled_time.slice(0, 5)
      );
    } else {
      setRole(profile.preferredRole || "");
      setTime("10:00");
    }
  };

  const handleSearch = () => {
    const query = searchInput.trim();

    if (!query) {
      setSearchQuery("");
      setShowSuggestions(true);
      return;
    }

    setSearchQuery(query);
    setShowSuggestions(false);

    const matchingSchedule = schedules.find(
      (schedule) => {
        const searchableText = [
          schedule.role,
          schedule.scheduled_date,
          schedule.scheduled_time,
          schedule.status,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          query.toLowerCase()
        );
      }
    );

    if (matchingSchedule) {
      const scheduleDate =
        matchingSchedule.scheduled_date;

      const scheduleDateObject = new Date(
        `${scheduleDate}T00:00:00`
      );

      setCurrentMonth(
        new Date(
          scheduleDateObject.getFullYear(),
          scheduleDateObject.getMonth(),
          1
        )
      );

      setSelectedDate(scheduleDate);
      setSelectedInterview(null);
      setRole(matchingSchedule.role);
      setTime(
        matchingSchedule.scheduled_time.slice(0, 5)
      );
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setShowSuggestions(false);
    setSelectedInterview(null);
  };

  const handleSearchScheduleClick = (
    schedule: Schedule
  ) => {
    const scheduleDateObject = new Date(
      `${schedule.scheduled_date}T00:00:00`
    );

    setCurrentMonth(
      new Date(
        scheduleDateObject.getFullYear(),
        scheduleDateObject.getMonth(),
        1
      )
    );

    setSelectedDate(schedule.scheduled_date);
    setSelectedInterview(null);
    setRole(schedule.role);
    setTime(
      schedule.scheduled_time.slice(0, 5)
    );

    setSearchInput("");
    setSearchQuery("");
    setShowSuggestions(false);

    setTimeout(() => {
      document
        .getElementById("interview-calendar")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 50);
  };

  const handleInterviewResultClick = (
    interview: Interview
  ) => {
    setSelectedInterview(interview);
    setSelectedDate("");
    setShowSuggestions(false);
    setSearchInput(interview.role);
    setSearchQuery(interview.role);

    setTimeout(() => {
      document
        .getElementById("selected-interview")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 50);
  };

  const handleFeatureClick = (
    featureName: string
  ) => {
    setShowSuggestions(false);

    if (featureName === "Resume Analyzer") {
      router.push("/resumeanalyzer");
      return;
    }

    if (featureName === "AI Interview") {
      router.push("/dashboard/interview");
      return;
    }

    if (featureName === "Settings") {
      router.push("/settings");
      return;
    }

    if (featureName === "Interview Schedule") {
      setSelectedInterview(null);
      setSearchInput("");
      setSearchQuery("");

      setTimeout(() => {
        document
          .getElementById("interview-calendar")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 50);

      return;
    }

    setSearchInput(featureName);
    setSearchQuery(featureName);
    setSelectedInterview(null);

    setTimeout(() => {
      document
        .getElementById("interview-search-results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 50);
  };

  const handleSchedule = async () => {
    if (!selectedDate) {
      alert("Please select an interview date.");
      return;
    }

    if (!role.trim()) {
      alert("Please enter an interview role.");
      return;
    }

    if (!time) {
      alert("Please select an interview time.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/interview-schedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            scheduled_date: selectedDate,
            scheduled_time: time,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to schedule interview."
        );
        return;
      }

      setSchedules((previous) => [
        ...previous.filter(
          (item) =>
            item.scheduled_date !== selectedDate
        ),
        data.schedule,
      ]);

      alert("Interview scheduled successfully!");
    } catch (error) {
      console.log(error);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const filteredInterviews = interviews.filter(
    (interview) =>
      !hasSearch ||
      interview.role
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const selectedDateLabel = selectedDate
    ? new Date(
        `${selectedDate}T00:00:00`
      ).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <aside
      className={`${poppins.className} w-[34%] min-w-[320px] max-w-[390px] shrink-0 border-l border-black/[0.035] bg-[#f5f5f3] px-6 py-7`} 
    >
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-[44px] flex-1 items-center rounded-full border border-black/[0.025] bg-white px-4 shadow-[0_8px_24px_rgba(0,0,0,0.035)]">
            <Search
              size={15}
              className="shrink-0 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search interviews and features"
              value={searchInput}
              onFocus={() =>
                setShowSuggestions(true)
              }
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }

                if (e.key === "Escape") {
                  setShowSuggestions(false);
                }
              }}
              className="ml-2 w-full bg-transparent text-[12px] font-medium outline-none placeholder:text-gray-400"
            />

            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200"
              >
                <X size={10} />
              </button>
            )}
          </div>

          <button
            onClick={
              hasSearch
                ? handleClearSearch
                : handleSearch
            }
            className="flex h-[44px] shrink-0 items-center gap-1.5 rounded-full bg-black px-4 text-[11px] font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90"
          >
            {hasSearch ? "Clear" : "Go"}

            {hasSearch ? (
              <X size={11} />
            ) : (
              <ArrowUpRight size={11} />
            )}
          </button>

          <UserAvatar />
        </div>

        {showSuggestions && !hasSearch && (
          <div className="absolute left-0 right-[68px] top-[48px] z-50 rounded-[22px] bg-white p-4 shadow-[0_12px_35px_rgba(0,0,0,0.10)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-400">
                  Search suggestions
                </p>

                <p className="mt-0.5 text-[13px] font-semibold">
                  {hasSuggestionInput
                    ? `Results for "${searchInput}"`
                    : "What would you like to find?"}
                </p>
              </div>

              <Search
                size={13}
                className="text-gray-300"
              />
            </div>

            {totalSuggestions === 0 ? (
              <div className="mt-3 rounded-[17px] bg-[#f4c7df] p-3 text-center">
                <p className="text-[10px] font-semibold">
                  No suggestions found
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Try a role, feature name, date, or
                  status.
                </p>
              </div>
            ) : (
              <div className="mt-3 max-h-[330px] space-y-3 overflow-y-auto">
                {suggestionResults.schedules.length >
                  0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.6px] text-gray-400">
                      Scheduled Interviews
                    </p>

                    <div className="space-y-1.5">
                      {suggestionResults.schedules.map(
                        (schedule) => (
                          <button
                            key={schedule.id}
                            onClick={() =>
                              handleSearchScheduleClick(
                                schedule
                              )
                            }
                            className="flex w-full items-center gap-2.5 rounded-[15px] bg-[#d2e5e5] p-2.5 text-left transition hover:-translate-y-0.5"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                              <CalendarDays
                                size={12}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[10px] font-semibold">
                                {schedule.role}
                              </p>

                              <p className="mt-0.5 text-[10px] text-gray-500">
                                {new Date(
                                  `${schedule.scheduled_date}T00:00:00`
                                ).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}{" "}
                                ·{" "}
                                {schedule.scheduled_time.slice(
                                  0,
                                  5
                                )}
                              </p>
                            </div>

                            <ArrowUpRight size={11} />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {suggestionResults.interviews.length >
                  0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.6px] text-gray-400">
                      Recent Interviews
                    </p>

                    <div className="space-y-1.5">
                      {suggestionResults.interviews.map(
                        (interview, index) => (
                          <button
                            key={`${interview.created_at}-${index}`}
                            onClick={() =>
                              handleInterviewResultClick(
                                interview
                              )
                            }
                            className="flex w-full items-center gap-2.5 rounded-[15px] bg-[#f4c7df] p-2.5 text-left transition hover:-translate-y-0.5"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                              <BookOpen size={12} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[10px] font-semibold">
                                {interview.role}
                              </p>

                              <p className="mt-0.5 text-[10px] text-gray-500">
                                Recent interview ·{" "}
                                {interview.score}%
                              </p>
                            </div>

                            <ArrowUpRight size={11} />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {suggestionResults.features.length >
                  0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.6px] text-gray-400">
                      Interview IQ Features
                    </p>

                    <div className="space-y-1.5">
                      {suggestionResults.features.map(
                        (feature) => {
                          const Icon = feature.icon;

                          return (
                            <button
                              key={feature.name}
                              onClick={() =>
                                handleFeatureClick(
                                  feature.name
                                )
                              }
                              className="flex w-full items-center gap-2.5 rounded-[15px] bg-[#f5f5f3] p-2.5 text-left transition hover:-translate-y-0.5"
                            >
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                                <Icon size={12} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[10px] font-semibold">
                                  {feature.name}
                                </p>

                                <p className="mt-0.5 truncate text-[10px] text-gray-500">
                                  {feature.description}
                                </p>
                              </div>

                              <ArrowUpRight size={11} />
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {hasSearch && (
        <div
          id="interview-search-results"
          className="mt-4 rounded-[26px] border border-black/[0.025] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.035)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-400">
                Search results
              </p>

              <h3 className="mt-0.5 text-[16px] font-semibold">
                “{searchQuery}”
              </h3>
            </div>

            <div className="rounded-full bg-[#f5f5f3] px-3 py-1.5 text-[9px] font-semibold">
              {totalSearchResults} found
            </div>
          </div>

          {totalSearchResults === 0 ? (
            <div className="mt-3 rounded-[19px] bg-[#f4c7df] p-4 text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white">
                <Search size={15} />
              </div>

              <p className="mt-2 text-[12px] font-semibold">
                Not found
              </p>

              <p className="mt-1 text-[11px] text-gray-500">
                No scheduled interviews, recent
                interviews, or sidebar features match
                your search.
              </p>

              <button
                onClick={handleClearSearch}
                className="mt-3 rounded-full bg-black px-4 py-2 text-[9px] font-semibold text-white transition hover:opacity-80"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {searchResults.schedules.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <CalendarDays size={12} />

                    <p className="text-[10px] font-semibold">
                      Scheduled Interviews
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {searchResults.schedules.map(
                      (schedule) => (
                        <button
                          key={schedule.id}
                          onClick={() =>
                            handleSearchScheduleClick(
                              schedule
                            )
                          }
                          className="flex w-full items-center gap-3 rounded-[18px] bg-[#d2e5e5] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                            <CalendarDays size={13} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-semibold">
                              {schedule.role}
                            </p>

                            <p className="mt-1 text-[11px] text-gray-500">
                              {new Date(
                                `${schedule.scheduled_date}T00:00:00`
                              ).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}{" "}
                              ·{" "}
                              {schedule.scheduled_time.slice(
                                0,
                                5
                              )}
                            </p>
                          </div>

                          <ArrowUpRight size={12} />
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {searchResults.interviews.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <BookOpen size={12} />

                    <p className="text-[10px] font-semibold">
                      Recent Interviews
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {searchResults.interviews
                      .slice(0, 5)
                      .map((interview, index) => (
                        <button
                          key={`${interview.created_at}-${index}`}
                          onClick={() =>
                            handleInterviewResultClick(
                              interview
                            )
                          }
                          className={`flex w-full items-center gap-3 rounded-[18px] bg-[#f4c7df] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                            selectedInterview?.created_at ===
                              interview.created_at &&
                            selectedInterview?.role ===
                              interview.role
                              ? "ring-2 ring-black/10"
                              : ""
                          }`}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                            <BookOpen size={13} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-semibold">
                              {interview.role}
                            </p>

                            <p className="mt-1 text-[11px] text-gray-600">
                              {new Date(
                                interview.created_at
                              ).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>

                          <div className="rounded-full bg-white px-2.5 py-1.5 text-[9px] font-semibold">
                            {interview.score}%
                          </div>

                          <ArrowUpRight size={12} />
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {searchResults.features.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles size={12} />

                    <p className="text-[10px] font-semibold">
                      Interview IQ
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {searchResults.features.map(
                      (feature) => {
                        const Icon = feature.icon;

                        return (
                          <button
                            key={feature.name}
                            onClick={() =>
                              handleFeatureClick(
                                feature.name
                              )
                            }
                            className="flex w-full items-center gap-3 rounded-[18px] bg-[#f5f5f3] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                              <Icon size={13} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-semibold">
                                {feature.name}
                              </p>

                              <p className="mt-1 text-[11px] text-gray-500">
                                {feature.description}
                              </p>
                            </div>

                            <ArrowUpRight size={12} />
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedInterview && (
        <div
          id="selected-interview"
          className="mt-3 rounded-[23px] bg-[#f4c7df] p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500">
                Selected interview
              </p>

              <h3 className="mt-1 text-[17px] font-semibold text-[#151515]">
                {selectedInterview.role}
              </h3>

              <p className="mt-1 text-[11px] text-gray-500">
                {new Date(
                  selectedInterview.created_at
                ).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <button
              onClick={() =>
                setSelectedInterview(null)
              }
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition hover:bg-gray-100"
            >
              <X size={13} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-3 py-3">
            <div>
              <p className="text-[11px] text-gray-500">
                Interview score
              </p>

              <p className="mt-0.5 text-[16px] font-semibold">
                {selectedInterview.score}%
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4c7df]">
              <BarChart3 size={15} />
            </div>
          </div>
        </div>
      )}

      <div
        id="interview-calendar"
        className={hasSearch ? "mt-5" : "mt-8"}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[25px] font-semibold tracking-[-0.8px] text-[#151515]">
            Interview Schedule
          </h2>
        </div>

        <div className="mt-4 rounded-[28px] border border-black/[0.025] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.035)]">
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-semibold text-[#151515]">
              {monthName} {year}
            </h3>

            <div className="flex items-center gap-1">
              <button
                onClick={goToPreviousMonth}
                className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-gray-100"
              >
                <ChevronLeft size={14} />
              </button>

              <button
                onClick={goToNextMonth}
                className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-gray-100"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 text-center">
            {[
              "MON",
              "TUE",
              "WED",
              "THU",
              "FRI",
              "SAT",
              "SUN",
            ].map((day) => (
              <div
                key={day}
                className="text-[10px] font-semibold tracking-[0.5px] text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-7 gap-y-2.5 text-center">
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-8"
                  />
                );
              }

              const date = formatDate(day);

              const isSelected =
                selectedDate === date;

              const isScheduled =
                scheduledDates.includes(date);

              return (
                <button
                  key={date}
                  onClick={() =>
                    handleDateClick(day)
                  }
                  className="relative mx-auto flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100"
                >
                  {isScheduled && !isSelected && (
                    <span className="absolute inset-0 rounded-full bg-[#d2e5e5]" />
                  )}

                  {isSelected && (
                    <span className="absolute inset-0 rounded-full bg-black" />
                  )}

                  <span
                    className={`relative z-10 text-[15px] font-medium ${
                      isSelected
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {day}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div
          className={`mt-3 rounded-[23px] p-4 ${
            selectedSchedule
              ? "bg-[#d2e5e5]"
              : "bg-[#f7e0a2]"
          }`}
        >
          {selectedSchedule ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-gray-500">
                    Scheduled interview
                  </p>

                  <h3 className="mt-1 text-[17px] font-semibold text-[#151515]">
                    {selectedSchedule.role}
                  </h3>

                  <p className="mt-1 text-[11px] text-gray-500">
                    {selectedDateLabel}
                  </p>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <CalendarDays size={13} />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <Clock size={13} />
                </div>

                <div>
                  <p className="text-[11px] text-gray-500">
                    Interview time
                  </p>

                  <p className="text-[11px] font-semibold text-[#151515]">
                    {selectedSchedule.scheduled_time.slice(
                      0,
                      5
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
                <span className="text-[11px] text-gray-500">
                  Status
                </span>

                <span className="text-[9px] font-semibold uppercase tracking-[0.4px] text-[#151515]">
                  {selectedSchedule.status}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-gray-500">
                    Selected date
                  </p>

                  <h3 className="mt-1 text-[16px] font-semibold text-[#151515]">
                    Schedule Interview
                  </h3>

                  <p className="mt-1 text-[11px] text-gray-500">
                    {selectedDateLabel}
                  </p>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <CalendarDays size={13} />
                </div>
              </div>

              <input
                type="text"
                value={role}
                placeholder="Interview role"
                onChange={(e) =>
                  setRole(e.target.value)
                }
                className="mt-3 w-full rounded-xl border-0 bg-white px-3 py-2.5 text-[10px] outline-none"
              />

              <input
                type="time"
                value={time}
                onChange={(e) =>
                  setTime(e.target.value)
                }
                className="mt-2 w-full rounded-xl border-0 bg-white px-3 py-2.5 text-[10px] outline-none"
              />

              <button
                onClick={handleSchedule}
                disabled={saving}
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-[10px] font-semibold text-white transition hover:opacity-80 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Schedule Interview"}

                {!saving && (
                  <ArrowUpRight size={11} />
                )}
              </button>
            </>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="mt-3 rounded-[23px] bg-[#d2e5e5] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
              <CalendarDays size={15} />
            </div>

            <div>
              <p className="text-[12px] font-medium text-[#151515]">
                Select a date
              </p>

              <p className="mt-1 text-[12px] text-gray-500">
                Choose a date to schedule or view an
                interview.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[19px] font-semibold tracking-[-0.45px] text-[#151515]">
            Recent Interviews
          </h2>

          <span className="text-[12px] text-gray-400">
            {filteredInterviews.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {filteredInterviews.length === 0 ? (
            <div className="min-h-[80px] rounded-[21px] bg-[#f4c7df] p-4">
              <div className="flex h-full items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                  <BookOpen size={15} />
                </div>

                <div>
                  <p className="text-[12px] font-medium">
                    {hasSearch
                      ? "No matching interviews found."
                      : "No interviews completed yet."}
                  </p>

                  {!hasSearch && (
                    <p className="mt-1 text-[12px] text-gray-500">
                      Completed interviews will appear
                      here.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            filteredInterviews
              .slice(0, 5)
              .map((interview, index) => (
                <button
                  key={`${interview.created_at}-${index}`}
                  onClick={() =>
                    handleInterviewResultClick(
                      interview
                    )
                  }
                  className={`flex min-h-[80px] w-full items-center gap-3 rounded-[21px] bg-[#f4c7df] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                    selectedInterview?.created_at ===
                      interview.created_at &&
                    selectedInterview?.role ===
                      interview.role
                      ? "ring-2 ring-black/10"
                      : ""
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                    <BookOpen size={15} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">
                      {interview.role}
                    </p>

                    <p className="mt-1 text-[12px] text-gray-600">
                      {new Date(
                        interview.created_at
                      ).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div className="rounded-full bg-white px-3 py-2 text-[11px] font-semibold shadow-sm">
                    {interview.score}%
                  </div>

                  <ArrowUpRight size={13} />
                </button>
              ))
          )}
        </div>
      </div>

      <div className="mt-5 flex min-h-[96px] items-center gap-3 rounded-[23px] border border-black/[0.025] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.025)]">
        <MiniAvatarStack />

        <p className="text-[13px] font-medium leading-5 text-gray-500">
          Many candidates are preparing for interviews
          through Interview IQ.
        </p>
      </div>
    </aside>
  );
}