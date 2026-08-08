"use client";

import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { TINT } from "@/lib/colors";

export type DropdownOption = { label: string; value: string };

/**
 * Reusable, accessible dropdown/select built on Base UI's Select primitive.
 * Styled to match the app's form-field look (see `fieldClass` in dialogs) so it
 * drops in anywhere a native `<select>` was used, with a smooth open/close
 * transition instead of the browser's default popup.
 */
export const Dropdown = ({
  value, onChange, options, placeholder = "Select…", className = "", disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) => (
  <Select.Root items={options} value={value} onValueChange={v => onChange(v ?? "")} disabled={disabled}>
    <Select.Trigger
      className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-muted text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary data-popup-open:ring-2 data-popup-open:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <Select.Value placeholder={placeholder} />
      <Select.Icon className="text-muted-foreground/60 transition-transform duration-150 data-popup-open:rotate-180">
        <ChevronDown size={14} />
      </Select.Icon>
    </Select.Trigger>

    <Select.Portal>
      <Select.Positioner sideOffset={6} className="z-50 outline-none">
        <Select.Popup
          className="w-(--anchor-width) max-h-64 overflow-y-auto bg-popover text-popover-foreground border border-border rounded-lg shadow-2xl p-1 origin-(--transform-origin) transition-[opacity,transform] duration-150 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95"
        >
          <Select.List>
            {options.map(opt => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 text-sm rounded-md cursor-pointer select-none text-foreground outline-none transition-colors data-highlighted:${TINT.aqua.bg} data-highlighted:${TINT.aqua.fg}`}
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator className={`${TINT.teal.fg} shrink-0`}>
                  <Check size={13} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.List>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
);
