"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, Loader2, X } from "lucide-react";

export type SelectSearchOption = {
  value: string | number;
  label: string;
  subLabel?: string;
};

interface FormSelectSearchProps {
  label?: string;
  name?: string;
  value?: string | number;
  onChange?: (val: string) => void;
  options?: SelectSearchOption[];
  onSearchApi?: (query: string) => Promise<SelectSearchOption[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export default function FormSelectSearch({
  label,
  value,
  onChange,
  options: initialOptions = [],
  onSearchApi,
  placeholder = "Pilih atau cari...",
  searchPlaceholder = "Ketik untuk mencari...",
  required = false,
  disabled = false,
  error,
}: FormSelectSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiOptions, setApiOptions] = useState<SelectSearchOption[]>([]);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle API search with debounce
  useEffect(() => {
    if (!onSearchApi) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await onSearchApi(searchQuery);
        setApiOptions(results);
      } catch (e) {
        console.error("API search failed:", e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearchApi]);

  // Combined options (API results or local filter)
  const availableOptions = onSearchApi ? apiOptions : initialOptions;

  const filteredOptions = useMemo(() => {
    if (onSearchApi) return availableOptions;
    if (!searchQuery.trim()) return initialOptions;
    const q = searchQuery.toLowerCase();
    return initialOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(q))
    );
  }, [searchQuery, initialOptions, availableOptions, onSearchApi]);

  // Selected Option object
  const selectedObj = useMemo(() => {
    const all = [...initialOptions, ...apiOptions];
    return all.find((o) => String(o.value) === String(value)) || null;
  }, [value, initialOptions, apiOptions]);

  const handleSelect = (val: string | number) => {
    onChange?.(String(val));
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  return (
    <div className="relative w-full space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      {/* Trigger Box */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`flex items-center justify-between w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm transition cursor-pointer ${
          error
            ? "border-rose-400 focus:ring-rose-200"
            : isOpen
            ? "border-blue-600 ring-2 ring-blue-100"
            : "border-slate-200 hover:border-slate-300"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : ""}`}
      >
        <span className={`truncate ${selectedObj ? "text-slate-800 font-medium" : "text-slate-400"}`}>
          {selectedObj?.label || (value ? String(value) : placeholder)}
        </span>

        <div className="flex items-center gap-1.5 ml-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
              title="Reset pilihan"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}

      {/* Dropdown Panel with Search Input */}
      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-1.5 w-full rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Search box inside dropdown */}
          <div className="relative mb-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3.5 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
            {loading && (
              <Loader2
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-600"
              />
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar pr-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                {loading ? "Mencari data ke sistem..." : "Tidak ada data yang cocok"}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`flex items-center justify-between w-full rounded-xl px-3 py-2 text-left text-xs transition cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate font-semibold">{opt.label}</p>
                      {opt.subLabel && (
                        <p className="truncate text-[10px] text-slate-400 mt-0.5">{opt.subLabel}</p>
                      )}
                    </div>
                    {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

