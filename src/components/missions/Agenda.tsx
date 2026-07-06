/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Briefcase,
  MapPin,
  Users,
  MoreVertical,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  getDay,
  isWeekend,
} from "date-fns";
import { useI18n } from "@/i18n/LanguageProvider";
import { getDateFnsLocale } from "@/lib/i18n-date";

interface Mission {
  id: string | number;
  title: string;
  description: string;
  status: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  applications_count?: number;
}

interface AgendaProps {
  missions: Mission[];
  isLoading?: boolean;
  onMissionClick?: (mission: Mission) => void;
}

const COLORS = {
  draft: "bg-gray-100 border-gray-300 text-gray-700",
  published: "bg-blue-50 border-blue-200 text-blue-700",
  filled: "bg-amber-50 border-amber-200 text-amber-700",
  in_progress: "bg-green-50 border-green-200 text-green-700",
  completed: "bg-emerald-50 border-emerald-200 text-emerald-700",
  suspended: "bg-red-50 border-red-200 text-red-700",
};

const STATUS_LABELS = {
  draft: "Brouillon",
  published: "Publiée",
  filled: "Pourvue",
  in_progress: "En cours",
  completed: "Terminée",
  suspended: "Suspendue",
};

export default function Agenda({
  missions,
  isLoading,
  onMissionClick,
}: AgendaProps) {
  const { locale } = useI18n();
  const dateLocale = getDateFnsLocale(locale);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const weekDays =
    locale === "en"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  // Navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Calcul des jours du mois
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Regrouper les missions par date
  const missionsByDate = useMemo(() => {
    const map = new Map<string, Mission[]>();

    missions.forEach((mission) => {
      if (mission.start_date) {
        const date = format(new Date(mission.start_date), "yyyy-MM-dd");
        if (!map.has(date)) {
          map.set(date, []);
        }
        map.get(date)!.push(mission);
      }
    });

    return map;
  }, [missions]);

  // Missions du jour sélectionné
  const selectedDateMissions = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return missionsByDate.get(dateKey) || [];
  }, [selectedDate, missionsByDate]);

  // Missions à venir
  const upcomingMissions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return missions
      .filter((m) => m.start_date && new Date(m.start_date) >= today)
      .sort((a, b) => {
        if (!a.start_date || !b.start_date) return 0;
        return (
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
      })
      .slice(0, 5);
  }, [missions]);

  // Statistiques du mois
  const monthStats = useMemo(() => {
    const monthMissions = missions.filter((m) => {
      if (!m.start_date) return false;
      const date = new Date(m.start_date);
      return isSameMonth(date, currentDate);
    });

    return {
      total: monthMissions.length,
      byStatus: monthMissions.reduce(
        (acc, m) => {
          acc[m.status] = (acc[m.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }, [missions, currentDate]);

  if (isLoading) {
    return <AgendaSkeleton />;
  }

  return (
    <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Sidebar - Agende */}
        <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {locale === "en" ? "Today" : "Aujourd'hui"}
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {monthStats.total} mission{monthStats.total > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Calendrier */}
          <div className="p-4">
            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, index) => (
                <div
                  key={day}
                  className={`text-xs font-medium text-gray-500 text-center py-1 ${
                    index >= 5 ? "text-red-400" : ""
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Jours du mois */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayMissions = missionsByDate.get(dateKey) || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isWeekendDay = isWeekend(day);

                return (
                  <button
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative p-2 rounded-xl transition-all duration-200 min-h-[72px]
                      ${!isCurrentMonth ? "opacity-30" : ""}
                      ${isTodayDate ? "ring-2 ring-primary ring-offset-2" : ""}
                      ${isSelected ? "bg-primary/5 ring-2 ring-primary ring-offset-2" : ""}
                      ${isWeekendDay && isCurrentMonth ? "bg-red-50/30" : ""}
                      hover:bg-gray-50 hover:scale-105
                    `}
                  >
                    <span
                      className={`
                        text-sm font-medium block text-left
                        ${isTodayDate ? "text-primary" : ""}
                        ${!isCurrentMonth ? "text-gray-400" : ""}
                        ${isWeekendDay && isCurrentMonth ? "text-red-500" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </span>

                    {/* Indicateurs de missions */}
                    {dayMissions.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {dayMissions.slice(0, 3).map((mission, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              mission.status === "draft"
                                ? "bg-gray-400"
                                : mission.status === "published"
                                  ? "bg-blue-500"
                                  : mission.status === "filled"
                                    ? "bg-amber-500"
                                    : mission.status === "in_progress"
                                      ? "bg-green-500"
                                      : mission.status === "completed"
                                        ? "bg-emerald-500"
                                        : "bg-red-500"
                            }`}
                          />
                        ))}
                        {dayMissions.length > 3 && (
                          <span className="text-[8px] text-gray-400 font-medium">
                            +{dayMissions.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Détails du jour */}
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">
                {selectedDate
                  ? format(selectedDate, "EEEE d MMMM", { locale: dateLocale })
                  : locale === "en"
                    ? "Select a day"
                    : "Sélectionnez un jour"}
              </h3>
            </div>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Effacer
              </button>
            )}
          </div>

          {selectedDate ? (
            <div className="space-y-3">
              {selectedDateMissions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CalendarIcon size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Aucune mission ce jour
                  </p>
                </div>
              ) : (
                selectedDateMissions.map((mission) => (
                  <div
                    key={mission.id}
                    onClick={() => onMissionClick?.(mission)}
                    className="p-3 rounded-xl border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              COLORS[mission.status as keyof typeof COLORS] ||
                              COLORS.published
                            }`}
                          >
                            {STATUS_LABELS[
                              mission.status as keyof typeof STATUS_LABELS
                            ] || mission.status}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900 mt-1 truncate">
                          {mission.title}
                        </h4>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-100 transition-all">
                        <MoreVertical size={14} className="text-gray-400" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {mission.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {mission.location}
                        </span>
                      )}
                      {mission.applications_count !== undefined && (
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {mission.applications_count} candidat
                          {mission.applications_count > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarIcon size={32} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                Cliquez sur un jour du calendrier <br />
                pour voir les missions
              </p>
            </div>
          )}

          {/* Missions à venir */}
          {upcomingMissions.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                À venir
              </h4>
              <div className="space-y-2">
                {upcomingMissions.map((mission) => (
                  <div
                    key={mission.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Clock size={14} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {mission.title}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {mission.start_date &&
                          format(new Date(mission.start_date), "dd MMMM", {
                            locale: dateLocale,
                          })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SKELETON DE CHARGEMENT ──────────────────────────────────────────

function AgendaSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Partie calendrier */}
        <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-gray-100">
          {/* Header skeleton */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Calendrier skeleton */}
          <div className="p-4 space-y-3">
            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 w-full bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>

            {/* Jours du mois */}
            <div className="grid grid-cols-7 gap-1">
              {[...Array(35)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="p-4 lg:p-6 space-y-4">
          {/* Header sidebar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Missions skeleton */}
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-gray-100 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex gap-3">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* À venir skeleton */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-2 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
