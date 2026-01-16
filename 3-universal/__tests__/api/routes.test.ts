import { createMocks } from "node-mocks-http";
import recipesHandler from "@/pages/api/recipes";
import recipeByIdHandler from "@/pages/api/recipes/[id]";
import favoritesHandler from "@/pages/api/favorites/index";
import favoriteByIdHandler from "@/pages/api/favorites/[id]";
import loginHandler from "@/pages/api/auth/login";
import logoutHandler from "@/pages/api/auth/logout";
import meHandler from "@/pages/api/auth/me";
import helloHandler from "@/pages/api/hello";

const mockFetch = global.fetch as jest.Mock;

const createJwt = (payload: object) => {
  const base = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `header.${base}.signature`;
};

describe("API routes", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("recipes", () => {
    it("returns recipes on success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "1" }],
      });

      const { req, res } = createMocks({ method: "GET" });
      await recipesHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual([{ id: "1" }]);
    });

    it("propagates API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
      });

      const { req, res } = createMocks({ method: "GET" });
      await recipesHandler(req, res);

      expect(res._getStatusCode()).toBe(503);
      expect(res._getJSONData()).toEqual({ error: "API error" });
    });

    it("returns a single recipe", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "42" }),
      });

      const { req, res } = createMocks({
        method: "GET",
        query: { id: "42" },
      });
      await recipeByIdHandler(req, res);

      expect(mockFetch).toHaveBeenCalledWith("https://gourmet.cours.quimerch.com/recipes/42", expect.any(Object));
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ id: "42" });
    });
  });

  describe("auth routes", () => {
    it("rejects non-POST login requests", async () => {
      const { req, res } = createMocks({ method: "GET" });
      await loginHandler(req, res);
      expect(res._getStatusCode()).toBe(405);
    });

    it("stores api_token when login succeeds", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => (name === "set-cookie" ? "jwt_token=abc123;" : null),
        },
        json: async () => ({}),
      });

      const { req, res } = createMocks({
        method: "POST",
        body: { username: "chef", password: "secret" },
      });
      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()["set-cookie"]).toContain("api_token=abc123");
    });

    it("returns an error when login fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: "Bad credentials" }),
        headers: { get: () => null },
      });

      const { req, res } = createMocks({
        method: "POST",
        body: { username: "chef", password: "wrong" },
      });
      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({ detail: "Bad credentials" });
    });

    it("returns 401 when /api/auth/me is called without token", async () => {
      const { req, res } = createMocks({ method: "GET" });
      await meHandler(req, res);
      expect(res._getStatusCode()).toBe(401);
    });

    it("returns user data when /api/auth/me succeeds", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ username: "chef" }),
      });

      const { req, res } = createMocks({
        method: "GET",
        headers: { cookie: "api_token=token" },
      });
      await meHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ username: "chef" });
    });

    it("clears cookies on logout", async () => {
      const { req, res } = createMocks({ method: "POST" });
      await logoutHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()["set-cookie"]).toContain("Expires=Thu, 01 Jan 1970");
    });
  });

  describe("favorites routes", () => {
    it("requires authentication to list favorites", async () => {
      const { req, res } = createMocks({ method: "GET" });
      await favoritesHandler(req, res);
      expect(res._getStatusCode()).toBe(401);
    });

    it("returns mapped favorites", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ recipe: { id: "1", name: "Tarte" } }],
      });

      const { req, res } = createMocks({
        method: "GET",
        headers: { cookie: "api_token=token" },
      });
      await favoritesHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual([{ id: "1", name: "Tarte" }]);
    });

    it("rejects favorite actions without a token", async () => {
      const { req, res } = createMocks({
        method: "POST",
        query: { id: "1" },
      });
      await favoriteByIdHandler(req, res);
      expect(res._getStatusCode()).toBe(401);
    });

    it("rejects favorite actions with invalid tokens", async () => {
      const { req, res } = createMocks({
        method: "POST",
        query: { id: "1" },
        headers: { cookie: "api_token=not-a-jwt" },
      });
      await favoriteByIdHandler(req, res);
      expect(res._getStatusCode()).toBe(401);
    });

    it("adds a favorite when POST succeeds", async () => {
      const token = createJwt({ sub: "chef" });
      mockFetch.mockResolvedValueOnce({ ok: true });

      const { req, res } = createMocks({
        method: "POST",
        query: { id: "42" },
        headers: { cookie: `api_token=${token}` },
      });
      await favoriteByIdHandler(req, res);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gourmet.cours.quimerch.com/users/chef/favorites?recipeID=42",
        expect.objectContaining({ method: "POST" })
      );
      expect(res._getStatusCode()).toBe(200);
    });

    it("removes a favorite when DELETE succeeds", async () => {
      const token = createJwt({ sub: "chef" });
      mockFetch.mockResolvedValueOnce({ ok: true });

      const { req, res } = createMocks({
        method: "DELETE",
        query: { id: "42" },
        headers: { cookie: `api_token=${token}` },
      });
      await favoriteByIdHandler(req, res);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://gourmet.cours.quimerch.com/users/chef/favorites?recipeID=42",
        expect.objectContaining({ method: "DELETE" })
      );
      expect(res._getStatusCode()).toBe(200);
    });

    it("rejects unsupported methods", async () => {
      const token = createJwt({ sub: "chef" });
      const { req, res } = createMocks({
        method: "PUT",
        query: { id: "42" },
        headers: { cookie: `api_token=${token}` },
      });
      await favoriteByIdHandler(req, res);
      expect(res._getStatusCode()).toBe(405);
    });
  });

  it("hello route returns a payload", async () => {
    const { req, res } = createMocks({ method: "GET" });
    await helloHandler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ name: "John Doe" });
  });
});
