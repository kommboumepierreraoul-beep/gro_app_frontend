/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  UserPlus,
  UserCheck,
  MessageCircle,
  Filter,
  X,
  ChevronDown,
  Mail,
  MapPin,
  Briefcase,
  Star,
  Clock,
  Award,
  Crown,
  Sparkles,
  Loader2,
  Grid3x3,
  List,
  User,
  Shield,
  CheckCircle,
  Crown as CrownIcon,
  TrendingUp,
  Heart,
  Share2,
  ArrowLeft,
} from "lucide-react";

import { Avatar } from "@/components/community/shared/Avatar";
import { useAuthStore } from "@/stores/auth.store";
import { messageService } from "@/services/community/message.service";

// Types
interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  avatar?: string | null;
  headline?: string;
  location?: string;
  bio?: string;
  is_following?: boolean;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  rating?: number;
  is_verified?: boolean;
  is_premium?: boolean;
  created_at: string;
}

type SortOption = "recent" | "popular" | "rating" | "followers";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Plus récents" },
  { value: "popular", label: "Plus populaires" },
  { value: "rating", label: "Mieux notés" },
  { value: "followers", label: "Plus suivis" },
];

const ROLE_FILTERS = [
  { value: "all", label: "Tous", icon: Users },
  { value: "premium", label: "Premium", icon: CrownIcon },
  { value: "verified", label: "Vérifiés", icon: CheckCircle },
  { value: "top", label: "Top membres", icon: TrendingUp },
];

// Mock data - À remplacer par vos données réelles
const MOCK_USERS: UserProfile[] = [
  {
    id: 1,
    firstname: "Jean",
    lastname: "Dupont",
    email: "jean.dupont@email.com",
    avatar: null,
    headline: "Développeur Full Stack",
    location: "Yaoundé, Cameroun",
    bio: "Passionné par le développement web et les technologies vertes.",
    is_following: false,
    followers_count: 245,
    following_count: 123,
    posts_count: 56,
    rating: 4.8,
    is_verified: true,
    is_premium: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    firstname: "Marie",
    lastname: "Kamga",
    email: "marie.kamga@email.com",
    avatar: null,
    headline: "Agronome & Consultante",
    location: "Douala, Cameroun",
    bio: "Spécialiste en agriculture durable et agroécologie.",
    is_following: true,
    followers_count: 189,
    following_count: 87,
    posts_count: 34,
    rating: 4.9,
    is_verified: true,
    is_premium: false,
    created_at: "2024-02-20T14:30:00Z",
  },
  {
    id: 3,
    firstname: "Pierre",
    lastname: "Ndam",
    email: "pierre.ndam@email.com",
    avatar: null,
    headline: "Entrepreneur agricole",
    location: "Bafoussam, Cameroun",
    bio: "Fondateur d'une startup agritech innovante.",
    is_following: false,
    followers_count: 312,
    following_count: 156,
    posts_count: 78,
    rating: 4.7,
    is_verified: false,
    is_premium: true,
    created_at: "2023-11-01T09:15:00Z",
  },
  {
    id: 4,
    firstname: "Sophie",
    lastname: "Tchoffo",
    email: "sophie.tchoffo@email.com",
    avatar: null,
    headline: "Chercheuse en biodiversité",
    location: "Garoua, Cameroun",
    bio: "Étudie les écosystèmes et la conservation de la nature.",
    is_following: false,
    followers_count: 98,
    following_count: 210,
    posts_count: 45,
    rating: 4.5,
    is_verified: true,
    is_premium: false,
    created_at: "2024-03-10T16:45:00Z",
  },
  {
    id: 5,
    firstname: "David",
    lastname: "Eboua",
    email: "david.eboua@email.com",
    avatar: null,
    headline: "Formateur en permaculture",
    location: "Bertoua, Cameroun",
    bio: "Transmet les techniques de permaculture aux communautés rurales.",
    is_following: false,
    followers_count: 167,
    following_count: 94,
    posts_count: 62,
    rating: 4.9,
    is_verified: false,
    is_premium: false,
    created_at: "2024-04-05T11:20:00Z",
  },
  {
    id: 6,
    firstname: "Catherine",
    lastname: "Mballa",
    email: "catherine.mballa@email.com",
    avatar: null,
    headline: "Journaliste environnementale",
    location: "Yaoundé, Cameroun",
    bio: "Raconte les histoires de ceux qui protègent notre planète.",
    is_following: false,
    followers_count: 534,
    following_count: 432,
    posts_count: 120,
    rating: 4.6,
    is_verified: true,
    is_premium: true,
    created_at: "2023-08-15T08:00:00Z",
  },
];

export default function CommunityUsersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(false);
  const [messagingUserId, setMessagingUserId] = useState<number | null>(null);

  // Filtrer et trier les utilisateurs
  const filteredUsers = useMemo(() => {
    let result = [...MOCK_USERS];

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstname.toLowerCase().includes(query) ||
          u.lastname.toLowerCase().includes(query) ||
          u.headline?.toLowerCase().includes(query) ||
          u.location?.toLowerCase().includes(query) ||
          u.bio?.toLowerCase().includes(query),
      );
    }

    // Filtre par rôle
    if (selectedRole === "premium") {
      result = result.filter((u) => u.is_premium);
    } else if (selectedRole === "verified") {
      result = result.filter((u) => u.is_verified);
    } else if (selectedRole === "top") {
      result = result.filter((u) => (u.rating || 0) >= 4.5);
    }

    // Tri
    switch (sortBy) {
      case "recent":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      case "popular":
        result.sort((a, b) => (b.posts_count || 0) - (a.posts_count || 0));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "followers":
        result.sort(
          (a, b) => (b.followers_count || 0) - (a.followers_count || 0),
        );
        break;
    }

    return result;
  }, [searchQuery, selectedRole, sortBy]);

  // Statistiques
  const stats = {
    total: MOCK_USERS.length,
    online: Math.round(MOCK_USERS.length * 0.4),
    premium: MOCK_USERS.filter((u) => u.is_premium).length,
    verified: MOCK_USERS.filter((u) => u.is_verified).length,
  };

  const handleMessage = async (userId: number) => {
    try {
      setMessagingUserId(userId);
      // Simuler la création d'une conversation
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push(`/community/messages?user=${userId}`);
    } catch (error) {
      console.error("Erreur lors de la création de la discussion:", error);
    } finally {
      setMessagingUserId(null);
    }
  };

  const handleFollow = (userId: number) => {
    // Logique de follow
    console.log("Follow user:", userId);
  };

  return (
    <div className="min-h-screen bg-[#f9faf2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ─── HEADER ─── */}
        <div className="rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-6 mb-6 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#154212] flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#191c18]">
                    Membres de la communauté
                  </h1>
                  <p className="text-sm text-[#72796e]">
                    {stats.total} membres • {stats.online} en ligne
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/community"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#c2c9bb]/30 text-[#42493e] hover:bg-[#f9faf2] hover:border-[#154212] transition text-sm font-medium"
              >
                <ArrowLeft size={16} />
                Retour
              </Link>
            </div>
          </div>
        </div>

        {/* ─── STATS ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#eaf3de] rounded-xl p-3 text-center border border-[#bcf0ae]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-[#154212]" />
              <span className="text-lg font-bold text-[#191c18]">
                {stats.total}
              </span>
            </div>
            <p className="text-xs font-medium text-[#42493e]">Total membres</p>
          </div>

          <div className="bg-[#d4e8c4] rounded-xl p-3 text-center border border-[#bcf0ae]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <CrownIcon className="w-4 h-4 text-[#154212]" />
              <span className="text-lg font-bold text-[#191c18]">
                {stats.premium}
              </span>
            </div>
            <p className="text-xs font-medium text-[#42493e]">Premium</p>
          </div>

          <div className="bg-[#f3f4ed] rounded-xl p-3 text-center border border-[#c2c9bb]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <CheckCircle className="w-4 h-4 text-[#154212]" />
              <span className="text-lg font-bold text-[#191c18]">
                {stats.verified}
              </span>
            </div>
            <p className="text-xs font-medium text-[#42493e]">Vérifiés</p>
          </div>

          <div className="bg-[#eaf3de] rounded-xl p-3 text-center border border-[#bcf0ae]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Clock className="w-4 h-4 text-[#154212]" />
              <span className="text-lg font-bold text-[#191c18]">
                {stats.online}
              </span>
            </div>
            <p className="text-xs font-medium text-[#42493e]">En ligne</p>
          </div>
        </div>

        {/* ─── RECHERCHE ET FILTRES ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#72796e]" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#f9faf2] border border-[#c2c9bb]/30 rounded-xl text-sm text-[#191c18] outline-none focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212] transition placeholder:text-[#72796e]"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none px-4 py-2.5 bg-[#f9faf2] border border-[#c2c9bb]/30 rounded-xl text-sm text-[#191c18] outline-none focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212] transition pr-10"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#72796e] pointer-events-none" />
              </div>

              {/* Vue switch */}
              <div className="flex gap-1 p-1 bg-[#f9faf2] rounded-xl border border-[#c2c9bb]/30">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-[#154212]"
                      : "text-[#72796e] hover:text-[#191c18]"
                  }`}
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-[#154212]"
                      : "text-[#72796e] hover:text-[#191c18]"
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Filtres de rôles */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#c2c9bb]/20">
            {ROLE_FILTERS.map((role) => {
              const Icon = role.icon;
              const isActive = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#154212] text-white shadow-lg shadow-[#154212]/20"
                      : "bg-[#f9faf2] text-[#42493e] hover:bg-[#eaf3de] border border-[#c2c9bb]/30"
                  }`}
                >
                  <Icon size={14} />
                  {role.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── LISTE DES MEMBRES ─── */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#154212]" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-12 text-center">
            <Users className="w-16 h-16 text-[#72796e] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#191c18] mb-2">
              Aucun membre trouvé
            </h3>
            <p className="text-sm text-[#72796e]">
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }
          >
            {filteredUsers.map((userProfile) => (
              <UserCard
                key={userProfile.id}
                user={userProfile}
                viewMode={viewMode}
                onMessage={handleMessage}
                onFollow={handleFollow}
                isMessaging={messagingUserId === userProfile.id}
              />
            ))}
          </div>
        )}

        {/* ─── FOOTER ─── */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-[#c2c9bb]/30">
          <p className="text-xs text-[#72796e] text-center">
            {filteredUsers.length} membre{filteredUsers.length > 1 ? "s" : ""}{" "}
            trouvé{filteredUsers.length > 1 ? "s" : ""}
            {searchQuery && ` pour "${searchQuery}"`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── USER CARD ─────────────────────────────────────────────────────────

function UserCard({
  user,
  viewMode,
  onMessage,
  onFollow,
  isMessaging,
}: {
  user: UserProfile;
  viewMode: "grid" | "list";
  onMessage: (id: number) => void;
  onFollow: (id: number) => void;
  isMessaging: boolean;
}) {
  const router = useRouter();
  const isFollowing = user.is_following;

  const getInitials = () => {
    return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`;
  };

  const handleCardClick = () => {
    router.push(`/profile/${user.id}`);
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-4 hover:shadow-md transition-all">
        <div className="flex items-center gap-4">
          <button onClick={handleCardClick} className="flex-shrink-0">
            <Avatar
              src={user.avatar || null}
              firstname={user.firstname}
              size="lg"
              className="ring-2 ring-[#bcf0ae]/30"
            />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCardClick}
                className="hover:text-[#154212] transition-colors"
              >
                <h3 className="font-semibold text-[#191c18]">
                  {user.firstname} {user.lastname}
                </h3>
              </button>
              {user.is_verified && (
                <CheckCircle
                  size={14}
                  className="text-[#154212] flex-shrink-0"
                />
              )}
              {user.is_premium && (
                <CrownIcon size={14} className="text-amber-500 flex-shrink-0" />
              )}
            </div>

            {user.headline && (
              <p className="text-sm text-[#72796e]">{user.headline}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-1">
              {user.location && (
                <span className="flex items-center gap-1 text-xs text-[#72796e]">
                  <MapPin size={12} />
                  {user.location}
                </span>
              )}
              {user.rating && user.rating > 0 && (
                <span className="flex items-center gap-1 text-xs text-[#72796e]">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {user.rating.toFixed(1)}
                </span>
              )}
              <span className="text-xs text-[#72796e]">
                {user.followers_count || 0} abonnés
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onFollow(user.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                isFollowing
                  ? "bg-[#f3f4ed] text-[#42493e] hover:bg-[#e2e3dc]"
                  : "bg-[#154212] text-white hover:bg-[#1d5a18]"
              }`}
            >
              {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
              {isFollowing ? "Suivi" : "Suivre"}
            </button>
            <button
              onClick={() => onMessage(user.id)}
              disabled={isMessaging}
              className="p-2 bg-[#eaf3de] text-[#154212] rounded-xl hover:bg-[#d4e8c4] transition-colors disabled:opacity-50"
              title="Envoyer un message"
            >
              {isMessaging ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <MessageCircle size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vue grille
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-5 hover:shadow-md transition-all group">
      <button onClick={handleCardClick} className="w-full text-left">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Avatar
              src={user.avatar || null}
              firstname={user.firstname}
              size="xl"
              className="ring-4 ring-[#bcf0ae]/30"
            />
            {user.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-[#154212] rounded-full p-0.5">
                <CheckCircle size={14} className="text-white" />
              </div>
            )}
            {user.is_premium && (
              <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
                <CrownIcon size={12} className="text-white" />
              </div>
            )}
          </div>

          <h3 className="font-semibold text-[#191c18] mt-3">
            {user.firstname} {user.lastname}
          </h3>

          {user.headline && (
            <p className="text-sm text-[#72796e] line-clamp-1">
              {user.headline}
            </p>
          )}

          {user.location && (
            <p className="text-xs text-[#72796e] flex items-center justify-center gap-1 mt-1">
              <MapPin size={12} />
              {user.location}
            </p>
          )}

          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[#72796e]">
            <span>{user.followers_count || 0} abonnés</span>
            {user.rating && user.rating > 0 && (
              <span className="flex items-center gap-0.5">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {user.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#c2c9bb]/20">
        <button
          onClick={() => onFollow(user.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            isFollowing
              ? "bg-[#f3f4ed] text-[#42493e] hover:bg-[#e2e3dc]"
              : "bg-[#154212] text-white hover:bg-[#1d5a18]"
          }`}
        >
          {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
          {isFollowing ? "Suivi" : "Suivre"}
        </button>
        <button
          onClick={() => onMessage(user.id)}
          disabled={isMessaging}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#eaf3de] text-[#154212] rounded-xl hover:bg-[#d4e8c4] transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isMessaging ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <MessageCircle size={14} />
          )}
          Message
        </button>
      </div>
    </div>
  );
}
