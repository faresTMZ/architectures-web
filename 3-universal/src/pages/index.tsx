import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  image_url: string;
  when_to_eat: string;
}

export default function Home() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/recipes")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des recettes");
        return res.json();
      })
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Load favorites if user is logged in
  useEffect(() => {
    if (!user) {
      setFavorites(new Set());
      return;
    }

    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) => {
        const favIds = new Set<string>(data.map((fav: Recipe) => fav.id));
        setFavorites(favIds);
      })
      .catch(() => {});
  }, [user]);

  const toggleFavorite = async (e: React.MouseEvent, recipeId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

    const isFavorite = favorites.has(recipeId);
    const method = isFavorite ? "DELETE" : "POST";

    try {
      const res = await fetch(`/api/favorites/${recipeId}`, { method });
      if (res.ok) {
        setFavorites((prev) => {
          const newFavs = new Set(prev);
          if (isFavorite) {
            newFavs.delete(recipeId);
          } else {
            newFavs.add(recipeId);
          }
          return newFavs;
        });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  return (
    <main className={`min-h-screen ${inter.className}`}>
      {/* Header avec image cuisine.jpeg */}
      <header className="relative w-full h-80 md:h-[450px]">
        <Image
          src="/cuisine.jpeg"
          alt="Cuisine"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70 flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
            Mes Recettes
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 max-w-md text-center px-4">
            Découvrez nos délicieuses recettes et partagez vos favoris
          </p>
        </div>
      </header>

      {/* Liste des recettes */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Nos recettes
          </h2>
          <span className="text-sm text-gray-500">
            {recipes.length} recettes disponibles
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recettes/${recipe.id}`}
                className="group block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={recipe.image_url}
                    alt={recipe.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {user && (
                    <button
                      onClick={(e) => toggleFavorite(e, recipe.id)}
                      className="absolute top-3 right-3 p-2.5 bg-white/95 rounded-full shadow-md hover:bg-white hover:scale-110 transition-all duration-200 z-10"
                    >
                      {favorites.has(recipe.id) ? (
                        <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 hover:text-red-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      )}
                    </button>
                  )}
                  <span className="absolute bottom-3 left-3 px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded-full shadow">
                    {recipe.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {recipe.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{recipe.prep_time + recipe.cook_time} min</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{recipe.servings} pers.</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
