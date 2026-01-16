import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

interface Recipe {
  id: string;
  name: string;
  description: string;
  instructions: string;
  category: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  image_url: string;
  when_to_eat: string;
  created_by: string;
}

export default function RecipeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/recipes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Recette introuvable");
        return res.json();
      })
      .then((data) => {
        setRecipe(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Check if recipe is in favorites
  useEffect(() => {
    if (!id || !user) return;

    fetch("/api/favorites")
      .then((res) => res.json())
      .then((favorites) => {
        const found = favorites.some((fav: Recipe) => fav.id === id);
        setIsFavorite(found);
      })
      .catch(() => {});
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user || !id) return;

    setFavoriteLoading(true);

    try {
      const method = isFavorite ? "DELETE" : "POST";
      const res = await fetch(`/api/favorites/${id}`, { method });

      if (res.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }

    setFavoriteLoading(false);
  };

  if (loading) {
    return (
      <main className={`min-h-screen flex items-center justify-center ${inter.className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-gray-500">Chargement de la recette...</p>
        </div>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className={`min-h-screen flex flex-col items-center justify-center ${inter.className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-red-500 text-lg mb-4">{error || "Recette introuvable"}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${inter.className}`}>
      {/* Header image */}
      <div className="relative w-full h-72 md:h-[500px]">
        <Image
          src={recipe.image_url}
          alt={recipe.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Back button */}
        <Link
          href="/"
          className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-800 hover:bg-white transition-all shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </Link>

        {/* Favorite button */}
        {user && (
          <button
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            className="absolute top-6 right-6 p-3.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all disabled:opacity-50"
          >
            {isFavorite ? (
              <svg className="w-7 h-7 text-red-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            ) : (
              <svg className="w-7 h-7 text-gray-500 hover:text-red-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            )}
          </button>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block mb-4 px-4 py-1.5 bg-indigo-500 text-white text-sm font-semibold rounded-full shadow">
              {recipe.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
              {recipe.name}
            </h1>
            <p className="mt-3 text-lg text-white/90 max-w-2xl">
              {recipe.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Info cards */}
        <div className="grid grid-cols-3 gap-4 -mt-16 relative z-10 mb-10">
          <div className="bg-white rounded-xl p-5 text-center shadow-lg border border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-800">{recipe.prep_time}</p>
            <p className="text-sm text-gray-500 mt-1">min préparation</p>
          </div>
          <div className="bg-white rounded-xl p-5 text-center shadow-lg border border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-800">{recipe.cook_time}</p>
            <p className="text-sm text-gray-500 mt-1">min cuisson</p>
          </div>
          <div className="bg-white rounded-xl p-5 text-center shadow-lg border border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-800">{recipe.servings}</p>
            <p className="text-sm text-gray-500 mt-1">portions</p>
          </div>
        </div>

        {/* When to eat */}
        {recipe.when_to_eat && (
          <section className="mb-10 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Quand la déguster</h2>
                <p className="text-gray-600">{recipe.when_to_eat}</p>
              </div>
            </div>
          </section>
        )}

        {/* Instructions */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </span>
            Instructions
          </h2>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="space-y-4">
              {recipe.instructions.split("\n").filter(step => step.trim()).map((step, index) => (
                <div key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 pt-1 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Author */}
        {recipe.created_by && (
          <div className="text-center text-sm text-gray-400 pt-6 border-t border-gray-100">
            Recette créée par <span className="font-medium text-gray-600">{recipe.created_by}</span>
          </div>
        )}
      </div>
    </main>
  );
}
