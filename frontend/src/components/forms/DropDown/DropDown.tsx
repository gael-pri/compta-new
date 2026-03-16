import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@lib/utils";

interface Option {
  key: string;
  value: string;
  icon?: string;
  avatar?: string;
  dotColor?: string;
}

interface DropDownProps {
  label: string;
  options: Option[];
  value?: string | string[];
  multi?: boolean;
  onChange?: (value: string | string[]) => void;
  selectedOptionVar?: (value: string | string[]) => void;
  showLabel?: boolean;
  type?: "default" | "icon" | "avatar" | "dot" | "search";
  state?: "placeholder" | "hover" | "default" | "focused" | "disabled";
  iconeUrl?: string;
  iconSize?: { width: string; height: string };
  className?: string;
}

const DropDown = ({
  label,
  options = [],
  value,
  multi = false,
  onChange,
  selectedOptionVar,
  showLabel = true,
  type = "default",
  state = "default",
  iconeUrl,
  iconSize,
  className,
}: DropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<string | string[]>(value || (multi ? [] : ""));

  const filteredOptions = useMemo(() => {
    return type === "search"
      ? options.filter((opt) =>
          opt.value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;
  }, [searchTerm, options, type]);

  useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
      selectedOptionVar?.(value);
    }
  }, [value, selectedOptionVar]);

  const toggleOption = (optionKey: string) => {
    if (multi) {
      const current = selected as string[];
      const exists = current.includes(optionKey);
      const updated = exists
        ? current.filter((k) => k !== optionKey)
        : [...current, optionKey];
      setSelected(updated);
      onChange?.(updated);
      selectedOptionVar?.(updated);
    } else {
      setSelected(optionKey);
      setIsOpen(false);
      onChange?.(optionKey);
      selectedOptionVar?.(optionKey);
    }
  };

  const renderSelectedLabel = () => {
    if (multi) {
      const arr = selected as string[];
      return arr.length > 0 ? `${arr.length} sélectionné(s)` : "Sélectionner...";
    }
    const opt = options.find((o) => o.key === selected);
    return opt?.value || "Sélectionner...";
  };

  return (
    <div className={cn("relative w-full", className)}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          {label}
          {iconeUrl && (
            <img
              src={iconeUrl}
              alt="icon"
              loading="lazy"
              width={parseInt(iconSize?.width || "16", 10)}
              height={parseInt(iconSize?.height || "16", 10)}
            />
          )}
        </label>
      )}
      <div
        className={cn(
          "relative w-full",
          state === "disabled" && "opacity-50 pointer-events-none"
        )}
      >
        <button
          type="button"
          className={cn(
            "w-full px-4 py-2 text-left bg-white border rounded-lg",
            "flex items-center justify-between gap-2",
            state === "hover" && "border-gray-400",
            state === "focused" && "ring-2 ring-blue-500",
            !state.match(/hover|focused/) && "border-gray-300"
          )}
          onClick={() => setIsOpen(!isOpen)}
          disabled={state === "disabled"}
        >
          {type === "search" ? (
            <input
              type="text"
              className="w-full border-none focus:outline-none"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span>{renderSelectedLabel()}</span>
          )}
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => {
              const isSelected = multi
                ? (selected as string[]).includes(option.key)
                : selected === option.key;
              return (
                <button
                  key={option.key}
                  className={cn(
                    "w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2",
                    isSelected && "bg-gray-100"
                  )}
                  onClick={() => toggleOption(option.key)}
                >
                  {type === "icon" && option.icon && (
                    <img src={option.icon} alt="" className="w-5 h-5" />
                  )}
                  {type === "avatar" && option.avatar && (
                    <img src={option.avatar} alt="" className="w-6 h-6 rounded-full" />
                  )}
                  {type === "dot" && option.dotColor && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: option.dotColor }}
                    />
                  )}
                  <span>{option.value}</span>
                  {isSelected && (
                    <svg
                      className="w-5 h-5 text-blue-500 ml-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropDown;
