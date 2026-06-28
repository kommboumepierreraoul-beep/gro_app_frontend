/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/static-components */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search as SearchIcon,
  User,
  FileText,
  Loader2,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/community/shared/Avatar";
import { profileService } from "@/services/community/profile.service";
import { postService } from "@/services/community/post.service";
import { PostCard } from "@/components/community/feed/posts/PostCard";
import { SearchHistory } from "@/components/community/search/SearchHistory";

type TabType = "all" | "users" | "posts";
type SortType = "recent" | "popular" | "oldest";
type FilterType = "all" | "text" | "image" | "video" | "pdf";

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getCleanQuery = useCallback(() => {
    const raw = searchParams.get("q") || "";
    return raw.replace(/\\/g, "").trim();
  }, [searchParams]);

  const initialQuery = getCleanQuery();

  // ── États ──────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [sortBy, setSortBy] = useState<SortType>("recent");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  // ── Refs pour les valeurs qui changent ──────────────────────────────────
  const filterTypeRef = useRef(filterType);
  const sortByRef = useRef(sortBy);

  // Mettre à jour les refs quand les états changent
  useEffect(() => {
    filterTypeRef.current = filterType;
  }, [filterType]);

  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);

  // ── Effets ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialQuery.length >= 2) {
      performSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // ── Mise à jour de la recherche ────────────────────────────────────────────
  const updateSearch = useCallback(
    (newQuery: string) => {
      const cleanQuery = newQuery.replace(/\\/g, "").trim();
      setQuery(cleanQuery);
      setPostsPage(1);
      setUsers([]);
      setPosts([]);
      setTotalUsers(0);
      setTotalPosts(0);

      if (cleanQuery.length >= 2) {
        router.push(`/search?q=${encodeURIComponent(cleanQuery)}`);
        performSearch(cleanQuery);
      } else if (cleanQuery.length === 0) {
        router.push("/search");
      }
    },
    [router],
  );

  // ── Recherche principale ──────────────────────────────────────────────────
  const performSearch = async (searchQuery: string) => {
    const cleanQuery = searchQuery.replace(/\\/g, "").trim();
    if (cleanQuery.length < 2) return;

    // 🔍 Rechercher utilisateurs
    setLoadingUsers(true);
    try {
      const userResults = await profileService.search(cleanQuery);
      setUsers(userResults || []);
      setTotalUsers(userResults?.length || 0);
    } catch (error) {
      console.error("Erreur recherche utilisateurs:", error);
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoadingUsers(false);
    }

    // 📝 Rechercher publications
    setLoadingPosts(true);
    try {
      const response = await postService.searchPosts(cleanQuery, 1);

      const postsData =
        response?.data?.data || response?.posts || response?.data || [];
      setPosts(Array.isArray(postsData) ? postsData : []);
      setTotalPosts(response?.data?.total || postsData.length || 0);
      setHasMorePosts(response?.data?.next_page_url !== null || false);
    } catch (error) {
      console.error("Erreur recherche publications:", error);
      setPosts([]);
      setTotalPosts(0);
    } finally {
      setLoadingPosts(false);
    }
  };

  // ── Recherche depuis l'historique ──────────────────────────────────────────
  const handleHistorySearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery);
    },
    [router],
  );

  // ── Chargement des pages suivantes ──────────────────────────────────────
  const loadMorePosts = useCallback(async () => {
    if (loadingMorePosts || !hasMorePosts) return;
    setLoadingMorePosts(true);
    try {
      const nextPage = postsPage + 1;
      const response = await postService.searchPosts(query, nextPage);

      const newPosts =
        response?.data?.data || response?.posts || response?.data || [];
      setPosts((prev) => [...prev, ...newPosts]);
      setPostsPage(nextPage);
      setHasMorePosts(response?.data?.next_page_url !== null || false);
    } catch (error) {
      console.error("Erreur chargement plus de posts:", error);
    } finally {
      setLoadingMorePosts(false);
    }
  }, [loadingMorePosts, hasMorePosts, postsPage, query]);

  const totalResults = users.length + posts.length;
  const isLoading = loadingUsers || loadingPosts;
  const hasResults = users.length > 0 || posts.length > 0;

  // ── Rendu des utilisateurs ────────────────────────────────────────────────
  const UsersList = useMemo(() => {
    if (users.length === 0 && !loadingUsers) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-950" />
            Utilisateurs ({totalUsers})
          </h3>
        </div>
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/community/profile/${user.id}`}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition group"
          >
            <Avatar src={user.avatar} firstname={user.firstname} size="lg" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 group-hover:text-green-950 transition">
                {user.firstname} {user.lastname}
              </p>
              {user.headline && (
                <p className="text-sm text-gray-500">{user.headline}</p>
              )}
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                <span>📊 {user.posts_count || 0} publications</span>
                <span>👥 {user.followers_count || 0} abonnés</span>
              </div>
            </div>
            <button className="px-4 py-2 bg-green-950 hover:bg-green-900 text-white text-sm font-medium rounded-xl transition opacity-0 group-hover:opacity-100">
              Voir le profil
            </button>
          </Link>
        ))}
      </div>
    );
  }, [users, loadingUsers, totalUsers]);

  // ── Rendu des publications ────────────────────────────────────────────────
  const PostsList = useMemo(() => {
    if (posts.length === 0 && !loadingPosts) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-950" />
            Publications ({totalPosts})
          </h3>
        </div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {hasMorePosts && (
          <button
            onClick={loadMorePosts}
            disabled={loadingMorePosts}
            className="w-full py-3 text-sm font-medium text-green-950 hover:bg-[#f3f4ed] rounded-xl transition disabled:opacity-50"
          >
            {loadingMorePosts ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Charger plus de publications"
            )}
          </button>
        )}
      </div>
    );
  }, [
    posts,
    loadingPosts,
    totalPosts,
    hasMorePosts,
    loadingMorePosts,
    loadMorePosts,
  ]);

  // ── Rendu mixte ────────────────────────────────────────────────────────────
  const MixedResults = useMemo(() => {
    const showUsers = users.length > 0;
    const showPosts = posts.length > 0;

    if (!showUsers && !showPosts) return null;

    return (
      <div className="space-y-8">
        {showUsers && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-950" />
                Utilisateurs ({totalUsers})
              </h3>
              {users.length > 3 && (
                <button
                  onClick={() => setActiveTab("users")}
                  className="text-xs text-green-950 hover:text-green-800 hover:underline"
                >
                  Voir tous ({totalUsers})
                </button>
              )}
            </div>
            <div className="space-y-2">
              {users.slice(0, 3).map((user) => (
                <Link
                  key={user.id}
                  href={`/community/profile/${user.id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition group"
                >
                  <Avatar
                    src={user.avatar}
                    firstname={user.firstname}
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-green-950 transition">
                      {user.firstname} {user.lastname}
                    </p>
                    {user.headline && (
                      <p className="text-sm text-gray-500">{user.headline}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {showPosts && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-950" />
                Publications ({totalPosts})
              </h3>
              {posts.length > 3 && (
                <button
                  onClick={() => setActiveTab("posts")}
                  className="text-xs text-green-950 hover:text-green-800 hover:underline"
                >
                  Voir toutes ({totalPosts})
                </button>
              )}
            </div>
            <div className="space-y-4">
              {posts.slice(0, 3).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }, [users, posts, totalUsers, totalPosts]);

  // ── Filtres ─────────────────────────────────────────────────────────────────
  const SortFilter = () => (
    <div className="flex items-center gap-2">
      <select
        value={sortBy}
        onChange={(e) => {
          const value = e.target.value as SortType;
          setSortBy(value);
          sortByRef.current = value;
          if (query.length >= 2) {
            performSearch(query);
          }
        }}
        className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-950/20 focus:border-green-950"
      >
        <option value="recent">Plus récents</option>
        <option value="popular">Plus populaires</option>
        <option value="oldest">Plus anciens</option>
      </select>

      <select
        value={filterType}
        onChange={(e) => {
          const value = e.target.value as FilterType;
          setFilterType(value);
          filterTypeRef.current = value;
          if (query.length >= 2) {
            performSearch(query);
          }
        }}
        className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-950/20 focus:border-green-950"
      >
        <option value="all">Tous les types</option>
        <option value="text">Texte</option>
        <option value="image">Images</option>
        <option value="video">Vidéos</option>
        <option value="pdf">PDF</option>
      </select>
    </div>
  );

  // ── Rendu principal ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f9faf2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex gap-6">
          {/* ─── Barre latérale gauche ─── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <SearchHistory
              onSearch={handleHistorySearch}
              currentQuery={query}
            />
          </aside>

          {/* ─── Contenu principal ─── */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <SearchIcon className="w-6 h-6 text-green-950" />
                Recherche
              </h1>
              <p className="text-sm text-gray-500">
                Trouvez des utilisateurs et des publications dans la communauté
              </p>
            </div>

            {/* Barre de recherche */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => updateSearch(e.target.value)}
                  placeholder="Rechercher des utilisateurs ou publications..."
                  className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-green-950/20 focus:border-green-950 transition"
                  autoFocus
                />
              </div>

              {/* Suggestions de recherche rapide */}
              {!query && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400 mr-1">
                    Suggestions :
                  </span>
                  {[
                    "agriculture",
                    "fermier",
                    "élevage",
                    "récolte",
                    "jardin",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => updateSearch(suggestion)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Résultats */}
            {query.length >= 2 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tabs et filtres */}
                <div className="flex flex-wrap items-center justify-between border-b border-gray-100 px-4">
                  <div className="flex">
                    {[
                      { id: "all", label: "Tous", count: totalResults },
                      { id: "users", label: "Utilisateurs", count: totalUsers },
                      { id: "posts", label: "Publications", count: totalPosts },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`px-4 py-3 text-sm font-medium transition relative ${
                          activeTab === tab.id
                            ? "text-green-950"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab.label}
                        {tab.count > 0 && (
                          <span
                            className={`ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full ${
                              activeTab === tab.id
                                ? "bg-green-950 text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                        {activeTab === tab.id && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-950" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Filtres de tri */}
                  {activeTab !== "users" && posts.length > 0 && <SortFilter />}
                </div>

                {/* Contenu des résultats */}
                <div className="p-4 sm:p-6">
                  {isLoading && !hasResults ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-green-950 animate-spin" />
                      <p className="mt-3 text-sm text-gray-500">
                        Recherche en cours...
                      </p>
                    </div>
                  ) : !hasResults ? (
                    <div className="text-center py-12">
                      <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Aucun résultat trouvé
                      </h3>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto">
                        Essayez avec d'autres mots-clés ou vérifiez
                        l'orthographe
                      </p>
                    </div>
                  ) : (
                    <>
                      {activeTab === "all" && MixedResults}
                      {activeTab === "users" && UsersList}
                      {activeTab === "posts" && PostsList}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Commencez votre recherche
                </h3>
                <p className="text-sm text-gray-500">
                  Saisissez au moins 2 caractères pour lancer la recherche
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
