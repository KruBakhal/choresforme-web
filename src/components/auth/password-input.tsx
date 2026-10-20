"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type" | "autoComplete"> & {
  id: string;
  autoComplete: "current-password" | "new-password";
};

/** Password field with a show/hide toggle (PRD). Toggling never clears the value. */
export function PasswordInput({ id, className, autoComplete, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        autoCapitalize="none"
        spellCheck={false}
        className={cn("pr-12", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className="absolute inset-y-0 right-0 rounded-l-none focus-visible:-outline-offset-2"
        aria-label={visible ? AUTH_COPY.fields.hidePassword : AUTH_COPY.fields.showPassword}
        aria-controls={id}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? (
          <EyeOff className="size-5 text-ink" aria-hidden />
        ) : (
          <Eye className="size-5 text-ink" aria-hidden />
        )}
      </Button>
    </div>
  );
}
