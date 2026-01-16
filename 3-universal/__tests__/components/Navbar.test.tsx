import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";

// Mock the AuthContext
const mockLogin = jest.fn();
const mockLogout = jest.fn();

jest.mock("@/contexts/AuthContext", () => ({
  ...jest.requireActual("@/contexts/AuthContext"),
  useAuth: () => ({
    user: null,
    loading: false,
    login: mockLogin,
    logout: mockLogout,
  }),
}));

describe("Navbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the logo and title", () => {
    render(<Navbar />);
    expect(screen.getByText("Mes Recettes")).toBeInTheDocument();
  });

  it("renders the Favoris link", () => {
    render(<Navbar />);
    expect(screen.getByText("Favoris")).toBeInTheDocument();
  });

  it("renders the Connexion button when not logged in", () => {
    render(<Navbar />);
    expect(screen.getByText("Connexion")).toBeInTheDocument();
  });

  it("opens login modal when clicking Connexion", () => {
    render(<Navbar />);

    const loginButton = screen.getByText("Connexion");
    fireEvent.click(loginButton);

    expect(screen.getByText("Accédez à vos recettes favorites")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Entrez votre nom d'utilisateur")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Entrez votre mot de passe")).toBeInTheDocument();
  });

  it("closes login modal when clicking Annuler", () => {
    render(<Navbar />);

    fireEvent.click(screen.getByText("Connexion"));
    expect(screen.getByText("Accédez à vos recettes favorites")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Annuler"));
    expect(screen.queryByText("Accédez à vos recettes favorites")).not.toBeInTheDocument();
  });

  it("submits login form and closes modal on success", async () => {
    mockLogin.mockResolvedValueOnce({ success: true });
    render(<Navbar />);

    fireEvent.click(screen.getByText("Connexion"));
    fireEvent.change(screen.getByPlaceholderText("Entrez votre nom d'utilisateur"), {
      target: { value: "chef" },
    });
    fireEvent.change(screen.getByPlaceholderText("Entrez votre mot de passe"), {
      target: { value: "secret" },
    });

    fireEvent.click(screen.getByText("Se connecter"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("chef", "secret");
      expect(screen.queryByText("Accédez à vos recettes favorites")).not.toBeInTheDocument();
    });
  });

  it("displays an error message when login fails", async () => {
    mockLogin.mockResolvedValueOnce({ success: false, error: "Identifiants incorrects" });
    render(<Navbar />);

    fireEvent.click(screen.getByText("Connexion"));
    fireEvent.change(screen.getByPlaceholderText("Entrez votre nom d'utilisateur"), {
      target: { value: "chef" },
    });
    fireEvent.change(screen.getByPlaceholderText("Entrez votre mot de passe"), {
      target: { value: "secret" },
    });

    fireEvent.click(screen.getByText("Se connecter"));

    await waitFor(() => {
      expect(screen.getByText("Identifiants incorrects")).toBeInTheDocument();
    });
  });
});

describe("Navbar with logged in user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Override the mock for logged in state
    jest.spyOn(require("@/contexts/AuthContext"), "useAuth").mockReturnValue({
      user: { username: "testuser" },
      loading: false,
      login: mockLogin,
      logout: mockLogout,
    });
  });

  it("displays username when logged in", () => {
    render(<Navbar />);
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("displays user initial in avatar", () => {
    render(<Navbar />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("shows Déconnexion button when logged in", () => {
    render(<Navbar />);
    expect(screen.getByText("Déconnexion")).toBeInTheDocument();
  });

  it("calls logout when clicking Déconnexion", () => {
    render(<Navbar />);

    fireEvent.click(screen.getByText("Déconnexion"));
    expect(mockLogout).toHaveBeenCalled();
  });
});
