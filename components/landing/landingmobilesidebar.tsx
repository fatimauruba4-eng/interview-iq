"use client";

import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger className="inline-flex h-12 w-12 items-center justify-center rounded-md hover:bg-muted">
        <Menu className="h-6 w-6" />
      </SheetTrigger>

      <SheetContent side="right">
        Sidebar content goes here
      </SheetContent>
    </Sheet>
  );
}