"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

interface FormInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  description?: string;
}

const FormInput = forwardRef<
  HTMLInputElement,
  FormInputProps
>(
  (
    {
      label,
      required = false,
      error,
      description,
      className = "",
      type = "text",
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={props.id ?? props.name}
            className="block text-sm font-medium text-slate-700"
          >
            {label}

            {required && (
              <span className="ml-1 text-red-500">
                *
              </span>
            )}
          </label>
        )}

        <input
          ref={ref}
          id={props.id ?? props.name}
          type={type}
          {...props}
          className={`
            h-10
            w-full
            rounded-lg
            border
            bg-white
            px-3
            text-sm
            text-slate-700
            outline-none
            transition

            placeholder:text-slate-400

            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/10

            disabled:cursor-not-allowed
            disabled:bg-slate-50
            disabled:text-slate-400

            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                : "border-slate-200"
            }

            ${className}
          `}
        />

        {description && !error && (
          <p className="text-xs text-slate-400">
            {description}
          </p>
        )}

        {error && (
          <p className="text-xs font-medium text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export default FormInput;