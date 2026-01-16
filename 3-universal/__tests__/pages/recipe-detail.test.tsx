import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RecipeDetail from "@/pages/recettes/[id]";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;
const mockFetch = global.fetch as jest.Mock;

const recipe = {
  id: "42",
  name: "Risotto",
  description: "Crémeux et parfumé",
  instructions: "Étapes...",
  category: "Plat",
  prep_time: 20,
  cook_time: 30,
  servings: 4,
  image_url: "https://example.com/risotto.jpg",
  when_to_eat: "Dîner",
  created_by: "chef",
};

describe("Recipe detail page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockUseRouter.mockReturnValue({
      query: { id: "42" },
    });
    mockUseAuth.mockReturnValue({
      user: null,
    });
  });

  it("shows the loading spinner while data is being fetched", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<RecipeDetail />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders recipe information when fetch succeeds", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => recipe,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<RecipeDetail />);

    await waitFor(() => {
      expect(screen.getByText("Risotto")).toBeInTheDocument();
      expect(screen.getByText("Crémeux et parfumé")).toBeInTheDocument();
      expect(mockFetch).toHaveBeenCalledWith("/api/recipes/42");
    });
  });

  it("displays an error state when the recipe cannot be loaded", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<RecipeDetail />);

    await waitFor(() => {
      expect(screen.getByText("Recette introuvable")).toBeInTheDocument();
      expect(screen.getByText("Retour à l'accueil")).toBeInTheDocument();
    });
  });

  it("allows toggling favorites when the user is authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: { username: "chef" },
    });

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => recipe,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({ ok: true });

    render(<RecipeDetail />);

    await waitFor(() => {
      expect(screen.getByText("Risotto")).toBeInTheDocument();
    });

    const favoriteButton = screen.getByRole("button", { name: "Ajouter aux favoris" });
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith("/api/favorites/42", { method: "POST" });
    });
  });
});
