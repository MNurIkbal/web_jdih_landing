"use client";

import Select, {
  GroupBase,
  OptionsOrGroups,
  StylesConfig,
} from "react-select";

import {
  Control,
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps<
  T extends FieldValues
> {
  name: Path<T>;
  control: Control<T>;

  label?: string;
  required?: boolean;
  placeholder?: string;

  options: OptionsOrGroups<
    SelectOption,
    GroupBase<SelectOption>
  >;

  error?: string;

  isDisabled?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;

  className?: string;
}

export default function FormSelect<
  T extends FieldValues
>({
  name,
  control,
  label,
  required = false,
  placeholder = "Pilih...",
  options,
  error,
  isDisabled = false,
  isClearable = true,
  isSearchable = true,
}: FormSelectProps<T>) {
  const customStyles: StylesConfig<
    SelectOption,
    false
  > = {
    control: (base, state) => ({
      ...base,

      minHeight: "40px",

      borderRadius: "8px",

      borderColor: error
        ? "#f87171"
        : state.isFocused
        ? "#3b82f6"
        : "#e2e8f0",

      boxShadow: state.isFocused
        ? error
          ? "0 0 0 2px rgba(239,68,68,0.10)"
          : "0 0 0 2px rgba(59,130,246,0.10)"
        : "none",

      "&:hover": {
        borderColor: error
          ? "#f87171"
          : "#94a3b8",
      },

      fontSize: "13px",

      backgroundColor: isDisabled
        ? "#f8fafc"
        : "#ffffff",
    }),

    placeholder: (base) => ({
      ...base,
      color: "#94a3b8",
    }),

    singleValue: (base) => ({
      ...base,
      color: "#334155",
    }),

    menu: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: "8px",
      overflow: "hidden",
    }),

    option: (
      base,
      state
    ) => ({
      ...base,
      fontSize: "13px",

      backgroundColor:
        state.isSelected
          ? "#2563eb"
          : state.isFocused
          ? "#eff6ff"
          : "#ffffff",

      color:
        state.isSelected
          ? "#ffffff"
          : "#334155",

      cursor: "pointer",
    }),

    input: (base) => ({
      ...base,
      color: "#334155",
    }),
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selectedOption =
            options
              ?.flatMap((item: any) =>
                item.options
                  ? item.options
                  : [item]
              )
              ?.find(
                (option: SelectOption) =>
                  option.value === field.value
              ) ?? null;

          return (
            <Select
              {...field}

              value={selectedOption}

              options={options}

              placeholder={placeholder}

              isDisabled={isDisabled}

              isClearable={isClearable}

              isSearchable={isSearchable}

              styles={customStyles}

              onChange={(option) => {
                field.onChange(
                  option?.value ?? null
                );
              }}

              onBlur={field.onBlur}

              className="text-sm"
            />
          );
        }}
      />

      {error && (
        <p className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}