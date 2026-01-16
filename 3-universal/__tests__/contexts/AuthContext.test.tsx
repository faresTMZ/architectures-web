import { render, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const mockFetch = global.fetch as jest.Mock;
const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

function renderWithAuth() {
  let current: ReturnType<typeof useAuth>;

  function Consumer() {
    current = useAuth();
    return null;
  }

  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );

  return () => current!;
}

describe("AuthContext", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("throws when useAuth is used outside of the provider", () => {
    const Consumer = () => {
      useAuth();
      return null;
    };

    expect(() => render(<Consumer />)).toThrow("useAuth must be used within an AuthProvider");
  });

  it("fetches the current user on mount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ username: "chef" }),
    });

    const getAuth = renderWithAuth();
    await waitFor(() => expect(getAuth().loading).toBe(false));
    expect(getAuth().user).toEqual({ username: "chef" });
  });

  it("sets user to null when /api/auth/me returns an error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    const getAuth = renderWithAuth();
    await waitFor(() => expect(getAuth().loading).toBe(false));
    expect(getAuth().user).toBeNull();
  });

  it("logs in the user and refreshes profile data", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false }) // initial /api/auth/me
      .mockResolvedValueOnce({ ok: true }) // /api/auth/login
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ username: "chef" }),
      }); // /api/auth/me after login

    const getAuth = renderWithAuth();
    await waitFor(() => expect(getAuth().loading).toBe(false));

    await act(async () => {
      const result = await getAuth().login("chef", "secret");
      expect(result).toEqual({ success: true });
    });

    expect(getAuth().user).toEqual({ username: "chef" });
  });

  it("returns an error when login fails", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false }) // initial /api/auth/me
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: "Invalid credentials" }),
      });

    const getAuth = renderWithAuth();
    await waitFor(() => expect(getAuth().loading).toBe(false));

    await act(async () => {
      const result = await getAuth().login("chef", "wrong");
      expect(result).toEqual({ success: false, error: "Invalid credentials" });
    });
  });

  it("clears the user on logout", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ username: "chef" }),
      })
      .mockResolvedValueOnce({ ok: true }); // logout call

    const getAuth = renderWithAuth();
    await waitFor(() => expect(getAuth().user).toEqual({ username: "chef" }));

    await act(async () => {
      await getAuth().logout();
    });

    expect(mockFetch).toHaveBeenLastCalledWith("/api/auth/logout", { method: "POST" });
    expect(getAuth().user).toBeNull();
  });
});
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });
