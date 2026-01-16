import { render, screen, waitFor } from "@testing-library/react";
import Favorites from "@/pages/favorites";

// Mock the AuthContext
const mockUseAuth = jest.fn();

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockFavorites = [
  {
    id: "1",
    name: "Tarte aux pommes",
    description: "Une délicieuse tarte aux pommes",
    category: "Dessert",
    prep_time: 30,
    cook_time: 45,
    servings: 8,
    image_url: "https://example.com/tarte.jpg",
  },
];

describe("Favorites Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it("shows login message when not authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText("Connectez-vous pour voir vos favoris")).toBeInTheDocument();
    });
  });

  it("shows loading state", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(<Favorites />);

    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("displays favorites when authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: { username: "testuser" },
      loading: false,
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFavorites,
    });

    render(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText("Tarte aux pommes")).toBeInTheDocument();
    });
  });

  it("shows empty state when no favorites", async () => {
    mockUseAuth.mockReturnValue({
      user: { username: "testuser" },
      loading: false,
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText("Vous n'avez pas encore de favoris")).toBeInTheDocument();
    });
  });

  it("shows error when fetch fails", async () => {
    mockUseAuth.mockReturnValue({
      user: { username: "testuser" },
      loading: false,
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText("Erreur lors du chargement des favoris")).toBeInTheDocument();
    });
  });
});
