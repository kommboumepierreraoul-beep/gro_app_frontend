"use client";

interface AlertProps {
  type: "success" | "error" | "info";
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  const styles = {
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50   border-red-200   text-red-700",
    info: "bg-blue-50  border-blue-200  text-blue-700",
  };

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
  };

  return (
    <div
      className={`flex items-start gap-2 p-4 rounded-xl border text-sm ${styles[type]}`}
    >
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}
