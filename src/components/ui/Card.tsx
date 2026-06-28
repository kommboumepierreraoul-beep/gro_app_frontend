// components/ui/Card.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  className,
  children,
  variant = "default",
  padding = "md",
  hover = false,
  ...props
}: CardProps) {
  const variantStyles = {
    default: {
      background: "rgba(249,250,242,0.9)",
      border: "1px solid rgba(194,201,187,0.3)",
    },
    outlined: {
      background: "transparent",
      border: "1px solid rgba(194,201,187,0.4)",
    },
    ghost: {
      background: "transparent",
      border: "none",
    },
  };

  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    md: "p-4 sm:p-5",
    lg: "p-5 sm:p-6",
  };

  const hoverStyles = hover
    ? "transition-all duration-200 hover:shadow-md hover:border-[rgba(45,90,39,0.2)] hover:-translate-y-0.5"
    : "";

  return (
    <div
      className={cn(
        "rounded-2xl",
        paddingStyles[padding],
        hoverStyles,
        className,
      )}
      style={{
        ...variantStyles[variant],
        boxShadow:
          variant === "default" ? "0 4px 20px rgba(21,66,18,0.06)" : "none",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Sous-composants
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function CardHeader({
  className,
  title,
  description,
  action,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 pb-4 border-b",
        className,
      )}
      style={{
        borderColor: "rgba(194,201,187,0.2)",
      }}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h3
            className="text-base font-semibold"
            style={{
              color: "#191c18",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {title}
          </h3>
        )}
        {description && (
          <p
            className="text-sm mt-0.5"
            style={{
              color: "#72796e",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {description}
          </p>
        )}
        {children}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export function CardContent({
  className,
  noPadding = false,
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={cn(noPadding ? "" : "pt-4", className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  border?: boolean;
}

export function CardFooter({
  className,
  border = true,
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn("mt-4 pt-4", border && "border-t", className)}
      style={{
        borderColor: border ? "rgba(194,201,187,0.2)" : "transparent",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Composant de statistique pour Card
interface CardStatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
    direction: "up" | "down" | "neutral";
  };
  color?: string;
}

export function CardStat({
  label,
  value,
  icon,
  trend,
  color = "#2d5a27",
}: CardStatProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `rgba(${color === "#2d5a27" ? "45,90,39" : "66,66,66"}, 0.08)`,
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <p
            className="text-sm font-medium"
            style={{
              color: "#72796e",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {label}
          </p>
          <p
            className="text-2xl font-bold"
            style={{
              color: "#191c18",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {value}
          </p>
        </div>
      </div>

      {trend && (
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            {trend.direction === "up" && (
              <TrendingUp size={16} style={{ color: "#15803d" }} />
            )}
            {trend.direction === "down" && (
              <TrendingDown size={16} style={{ color: "#b91c1c" }} />
            )}
            {trend.direction === "neutral" && (
              <span  style={{ color: "#72796e" }}>
                —
              </span>
            )}
            <span
              className="text-sm font-semibold"
              style={{
                color:
                  trend.direction === "up"
                    ? "#15803d"
                    : trend.direction === "down"
                      ? "#b91c1c"
                      : "#72796e",
              }}
            >
              {trend.direction !== "neutral" &&
                `${trend.value > 0 ? "+" : ""}${trend.value}%`}
            </span>
          </div>
          {trend.label && (
            <span
              className="text-xs"
              style={{
                color: "#72796e",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Composant de métrique pour Card
interface CardMetricProps {
  label: string;
  value: string | number;
  subValue?: string | number;
  progress?: number;
  progressColor?: string;
}

export function CardMetric({
  label,
  value,
  subValue,
  progress,
  progressColor = "#2d5a27",
}: CardMetricProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span
          className="text-sm font-medium"
          style={{
            color: "#72796e",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {label}
        </span>
        <span
          className="text-sm font-semibold"
          style={{
            color: "#191c18",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {value}
          {subValue !== undefined && (
            <span
              className="ml-1 text-xs font-normal"
              style={{ color: "#72796e" }}
            >
              {subValue}
            </span>
          )}
        </span>
      </div>
      {progress !== undefined && (
        <div
          className="w-full rounded-full overflow-hidden"
          style={{
            height: "4px",
            background: "rgba(194,201,187,0.2)",
          }}
        >
          <div
            className="rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(Math.max(progress, 0), 100)}%`,
              height: "100%",
              background: progressColor,
            }}
          />
        </div>
      )}
    </div>
  );
}

// Export principal
export default Card;
