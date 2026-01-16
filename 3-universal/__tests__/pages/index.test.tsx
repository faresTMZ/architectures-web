import { render, screen, waitFor } from "@testing-library/react";
import Home from "@/pages/index";

// Mock the AuthContext
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

const mockRecipes = [
  {
    id: "1",
    name: "Tarte aux pommes",
    description: "Une délicieuse tarte aux pommes",
    category: "Dessert",
    prep_time: 30,
    cook_time: 45,
    servings: 8,
    image_url: "https://example.com/tarte.jpg",
    when_to_eat: "Après le repas",
  },
  {
    id: "2",
    name: "Poulet rôti",
    description: "Poulet rôti aux herbes",
    category: "Plat principal",
    prep_time: 15,
    cook_time: 90,
    servings: 4,
    image_url: "https://example.com/poulet.jpg",
    when_to_eat: "Dimanche midi",
  },
];

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it("renders the main title", async () => {
    // Keep the fetch pending so no extra state updates run for this static assertion
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<Home />);

    expect(screen.getByText("Mes Recettes")).toBeInTheDocument();
  });

  it("shows loading spinner initially", () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<Home />);

    // The spinner should be present (animate-spin class)
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("displays recipes after loading", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecipes,
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Tarte aux pommes")).toBeInTheDocument();
      expect(screen.getByText("Poulet rôti")).toBeInTheDocument();
    });
  });

  it("displays recipe categories", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecipes,
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Dessert")).toBeInTheDocument();
      expect(screen.getByText("Plat principal")).toBeInTheDocument();
    });
  });

  it("displays cooking time", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecipes,
    });

    render(<Home />);

    await waitFor(() => {
      // 30 + 45 = 75 min for tarte
      expect(screen.getByText("75 min")).toBeInTheDocument();
      // 15 + 90 = 105 min for poulet
      expect(screen.getByText("105 min")).toBeInTheDocument();
    });
  });

  it("displays servings count", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecipes,
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("8 pers.")).toBeInTheDocument();
      expect(screen.getByText("4 pers.")).toBeInTheDocument();
    });
  });

  it("shows error message when fetch fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Erreur lors du chargement des recettes")).toBeInTheDocument();
    });
  });

  it("displays recipes count", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecipes,
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("2 recettes disponibles")).toBeInTheDocument();
    });
  });
});
