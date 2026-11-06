"use client";

import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface FormSwitchProps<
  T extends FieldValues
> {
  name: Path<T>;
  control: Control<T>;

  label?: string;
  description?: string;
  disabled?: boolean;
}

export default function FormSwitch<
  T extends FieldValues
>({
  name,
  control,
  label,
  description,
  disabled = false,
}: FormSwitchProps<T>) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0 pr-4">
        {label && (
          <p className="text-sm font-medium text-slate-700">
            {label}
          </p>
        )}

        {description && (
          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>
        )}
      </div>

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const checked =
            field.value === true;

          return (
            <button
              type="button"
              role="switch"
              aria-checked={checked}
              disabled={disabled}
              onClick={() => {
                field.onChange(!checked);
              }}
              onBlur={field.onBlur}
              className={`
                relative
                h-6
                w-11
                shrink-0
                rounded-full
                transition
                duration-200
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500/30

                ${
                  checked
                    ? "bg-blue-600"
                    : "bg-slate-300"
                }

                ${
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }
              `}
            >
              <span
                className={`
                  absolute
                  top-1/2
                  h-5
                  w-5
                  -translate-y-1/2
                  rounded-full
                  bg-white
                  shadow
                  transition
                  duration-200

                  ${
                    checked
                      ? "left-[22px]"
                      : "left-[2px]"
                  }
                `}
              />
            </button>
          );
        }}
      />
    </div>
  );
}