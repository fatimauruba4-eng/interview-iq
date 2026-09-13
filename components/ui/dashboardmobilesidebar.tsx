"use client";

import {
Sheet,
SheetTrigger,
SheetContent,
} from "@/components/ui/sheet";
import {
Menu,
FileText,
Settings,
BookOpen,
History,
User,
Mic,
BarChart3,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
{
href: "/resumeanalyzer",
label: "Resume Analyzer",
icon: FileText,
},
{
href: "/dashboard/interview",
label: "AI Interview",
icon: Mic,
},
{
href: "/dashboard/question-bank",
label: "Question Bank",
icon: BookOpen,
},
{
href: "/dashboard/interview-history",
label: "Interview History",
icon: History,
},
{
href: "/dashboard/analytics",
label: "Analytics",
icon: BarChart3,
},
{
href: "/dashboard/profile",
label: "Profile",
icon: User,
},
];

export default function DashboardMobileSidebar() {
const pathname = usePathname();

return ( <div className="md:hidden"> <Sheet> <SheetTrigger> <Menu className="h-10 w-10" /> </SheetTrigger>

```
    <SheetContent>
      <div className="flex h-full flex-col bg-white p-6">
        <div className="mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-2xl font-bold text-white">
            I
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href;

            return (
              <Link
                key={route.href}
                href={route.href}
                className={
                  isActive
                    ? "flex items-center gap-4 rounded-xl bg-black px-4 py-3 text-white"
                    : "flex items-center gap-4 rounded-xl px-4 py-3 text-gray-500 hover:bg-gray-100"
                }
              >
                <Icon size={22} />
                <span>{route.label}</span>
              </Link>
            );
          })}
        </div>

        <Link
          href="/dashboard/settings"
          className={
            pathname === "/dashboard/settings"
              ? "flex items-center gap-4 rounded-xl bg-black px-4 py-3 text-white"
              : "flex items-center gap-4 rounded-xl px-4 py-3 text-gray-500 hover:bg-gray-100"
          }
        >
          <Settings size={22} />
          <span>Settings</span>
        </Link>
      </div>
    </SheetContent>
  </Sheet>
</div>


);
}
