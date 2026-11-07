"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface FormDatePickerProps {
  label?: string;
  name?: string;
  value?: string;
  onChange?: (dateStr: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function FormDatePicker({
  label,
  value = "",
  onChange,
  required = false,
  disabled = false,
  error,
  placeholder = "Pilih tanggal...",
}: FormDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState<number>(
    Number.isNaN(initialDate.getTime()) ? new Date().getFullYear() : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(
    Number.isNaN(initialDate.getTime()) ? new Date().getMonth() : initialDate.getMonth()
  );

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Update calendar view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const result = `${viewYear}-${formattedMonth}-${formattedDay}`;
    onChange?.(result);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  // Generate days in month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Format display text
  const displayValue = value
    ? (() => {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        const day = d.getDate();
        const month = MONTH_NAMES[d.getMonth()];
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
      })()
    : "";

  return (
    <div className="relative w-full space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Trigger Button */}
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
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon size={16} className={value ? "text-blue-600" : "text-slate-400"} />
          <span className={`truncate text-sm ${displayValue ? "text-slate-800 font-medium" : "text-slate-400"}`}>
            {displayValue || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
              title="Hapus tanggal"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}

      {/* Calendar Popup Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-1.5 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header Month / Year Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-center font-bold text-sm text-slate-800">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 mt-2 mb-1 text-center text-[11px] font-bold text-slate-400">
            {DAY_NAMES.map((name) => (
              <div key={name} className="py-1">
                {name}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank leading cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-8" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedMonth = String(viewMonth + 1).padStart(2, "0");
              const formattedDay = String(day).padStart(2, "0");
              const currentCheck = `${viewYear}-${formattedMonth}-${formattedDay}`;
              const isSelected = value === currentCheck;
              const isToday =
                new Date().toISOString().split("T")[0] === currentCheck;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                      : isToday
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Shortcuts */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                onChange?.(today);
                setIsOpen(false);
              }}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

