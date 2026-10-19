"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { STYLEGUIDE_COPY } from "@/lib/constants";

export function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">{STYLEGUIDE_COPY.demo.openSheet}</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader className="pr-12">
          <SheetTitle>{STYLEGUIDE_COPY.demo.sheetTitle}</SheetTitle>
          <SheetDescription>{STYLEGUIDE_COPY.demo.sheetBody}</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
