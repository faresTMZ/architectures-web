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
}

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    fetch("/api/favorites")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des favoris");
        return res.json();
      })
      .then((data) => {
        setFavorites(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <main className={`min-h-screen flex items-center justify-center ${inter.className}`}>
        <p className="text-gray-500">Chargement...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={`min-h-screen flex flex-col items-center justify-center ${inter.className}`}>
        <p className="text-gray-600 mb-4">Connectez-vous pour voir vos favoris</p>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${inter.className}`}>
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mes Favoris</h1>

        {error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {!error && favorites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Vous n&apos;avez pas encore de favoris</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Découvrir les recettes
            </Link>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recettes/${recipe.id}`}
                className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={recipe.image_url}
                    alt={recipe.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs font-medium text-blue-600 uppercase">
                    {recipe.category}
                  </span>
                  <h3 className="text-lg font-semibold mt-1 group-hover:text-blue-600">
                    {recipe.name}
                  </h3>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {recipe.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
