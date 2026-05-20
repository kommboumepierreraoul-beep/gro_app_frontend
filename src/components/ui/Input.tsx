
"use client";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
            ${
              error
                ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300"
                : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

