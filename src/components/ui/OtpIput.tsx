"use client";
import { useRef, KeyboardEvent, ClipboardEvent } from "react";

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  length?: number;
}

export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    const digit = val.replace(/\D/, "").slice(-1);
    const newVal = [...value];
    newVal[index] = digit;
    onChange(newVal);
    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    const newVal = Array(length).fill("");
    pasted.split("").forEach((char, i) => {
      newVal[i] = char;
    });
    onChange(newVal);
    const nextIndex = Math.min(pasted.length, length - 1);
    refs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`
            w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
            ${
              value[index]
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-gray-50 text-gray-800"
            }
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white
          `}
        />
      ))}
    </div>
  );
}
