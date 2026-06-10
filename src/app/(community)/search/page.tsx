/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search as SearchIcon,
  User,
  FileText,
  Loader2,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Image as ImageIcon,
  Video,
  Megaphone,
} from "lucide-react";
import { Avatar } from "@/components/community/shared/Avatar";
import { TimeAgo } from "@/components/community/shared/TimeAgo";
import { profileService } from "@/services/community/profile.service";
import { postService } from "@/services/community/post.service";
import { PostCard } from "@/components/community/feed/PostCard";

type TabType = "all" | "users" | "posts";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);

  // Recherche initiale
  useEffect(() => {
    if (initialQuery.length >= 2) {
      performSearch();
    }
  }, [initialQuery]);

  // Mettre à jour l'URL quand la recherche change
  const updateSearch = (newQuery: string) => {
    setQuery(newQuery);
    setUsersPage(1);
    setPostsPage(1);
    setUsers([]);
    setPosts([]);

    if (newQuery.length >= 2) {
      router.push(`/community/search?q=${encodeURIComponent(newQuery)}`);
      performSearch(newQuery);
    }
  };

  const performSearch = async (searchQuery: string = query) => {
    if (searchQuery.length < 2) return;

    // Rechercher utilisateurs
    setLoadingUsers(true);
    try {
      const userResults = await profileService.search(searchQuery);
      setUsers(userResults || []);
      setHasMoreUsers(false);
    } catch (error) {
      console.error("Erreur recherche utilisateurs:", error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }

    // Rechercher publications
    setLoadingPosts(true);
    try {
      // Utiliser l'API existante pour rechercher les posts
      const response = await fetch(
        `/api/community/posts/search?q=${encodeURIComponent(searchQuery)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setPosts(data.data?.data || data.posts || []);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Erreur recherche publications:", error);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadMoreUsers = async () => {
    if (loadingMoreUsers || !hasMoreUsers) return;
    setLoadingMoreUsers(true);
    // Implémenter la pagination si nécessaire
    setLoadingMoreUsers(false);
  };

  const loadMorePosts = async () => {
    if (loadingMorePosts || !hasMorePosts) return;
    setLoadingMorePosts(true);
    // Implémenter la pagination si nécessaire
    setLoadingMorePosts(false);
  };

  const isLoading = loadingUsers || loadingPosts;
  const hasResults = users.length > 0 || posts.length > 0;

  // Composant pour le rendu des utilisateurs
  const UsersList = () => (
    <div className="space-y-2">
      {users.map((user) => (
        <Link
          key={user.id}
          href={`/profile/${user.id}`}
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition"
        >
          <Avatar src={user.avatar} firstname={user.firstname} size="lg" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {user.firstname} {user.lastname}
            </p>
            {user.headline && (
              <p className="text-sm text-gray-500">{user.headline}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>📊 {user.posts_count || 0} publications</span>
              <span>👥 {user.followers_count || 0} abonnés</span>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
            Voir le profil
          </button>
        </Link>
      ))}
    </div>
  );

  // Composant pour le rendu des publications
  const PostsList = () => (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );

  // Composant pour le rendu mixte
  const MixedResults = () => (
    <div className="space-y-6">
      {/* Section Utilisateurs */}
      {users.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Utilisateurs
            </h3>
            {users.length > 3 && (
              <button
                onClick={() => setActiveTab("users")}
                className="text-sm text-blue-600 hover:underline"
              >
                Voir tous ({users.length})
              </button>
            )}
          </div>
          <div className="space-y-2">
            {users.slice(0, 3).map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition"
              >
                <Avatar
                  src={user.avatar}
                  firstname={user.firstname}
                  size="md"
                />
                <div>
                  <p className="font-medium text-gray-900">
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

      {/* Section Publications */}
      {posts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Publications
            </h3>
            {posts.length > 3 && (
              <button
                onClick={() => setActiveTab("posts")}
                className="text-sm text-blue-600 hover:underline"
              >
                Voir toutes ({posts.length})
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Recherche</h1>
        <p className="text-sm text-gray-500">
          Trouvez des utilisateurs et des publications
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
            className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
            autoFocus
          />
        </div>

        {/* Suggestions de recherche rapide */}
        {!query && (
          <div className="mt-4 flex flex-wrap gap-2">
            <p className="text-xs text-gray-400 mr-2">Suggestions :</p>
            {["agriculture", "fermier", "élevage", "récolte"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => updateSearch(suggestion)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
                >
                  {suggestion}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {/* Résultats */}
      {query.length >= 2 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-4 text-sm font-medium transition ${
                activeTab === "all"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Tous ({users.length + posts.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-4 text-sm font-medium transition ${
                activeTab === "users"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Utilisateurs ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-4 text-sm font-medium transition ${
                activeTab === "posts"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Publications ({posts.length})
            </button>
          </div>

          {/* Contenu des résultats */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : !hasResults ? (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Aucun résultat trouvé
                </h3>
                <p className="text-sm text-gray-500">
                  Essayez avec d'autres mots-clés ou vérifiez l'orthographe
                </p>
              </div>
            ) : (
              <>
                {activeTab === "all" && <MixedResults />}
                {activeTab === "users" && <UsersList />}
                {activeTab === "posts" && <PostsList />}
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
  );
}
