import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";

// Helper function to extract token from cookie
function getApiToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/api_token=([^;]+)/);
  return match ? match[1] : null;
}

describe("Auth API Helper Functions", () => {
  describe("getApiToken", () => {
    it("should return null when no cookie header is provided", () => {
      expect(getApiToken(undefined)).toBeNull();
    });

    it("should return null when api_token cookie is not present", () => {
      expect(getApiToken("other_cookie=value")).toBeNull();
    });

    it("should extract api_token from cookie header", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test";
      expect(getApiToken(`api_token=${token}`)).toBe(token);
    });

    it("should extract api_token when multiple cookies are present", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test";
      expect(getApiToken(`other=value; api_token=${token}; another=test`)).toBe(token);
    });
  });
});

describe("JWT Token Parsing", () => {
  function getUsernameFromToken(token: string): string | null {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
      return decoded.sub || decoded.iss || null;
    } catch {
      return null;
    }
  }

  it("should return null for invalid token", () => {
    expect(getUsernameFromToken("invalid")).toBeNull();
  });

  it("should return null for malformed JWT", () => {
    expect(getUsernameFromToken("not.a.valid.jwt")).toBeNull();
  });

  it("should extract username from sub claim", () => {
    // Create a mock JWT with sub claim
    const payload = Buffer.from(JSON.stringify({ sub: "testuser" })).toString("base64url");
    const token = `header.${payload}.signature`;
    expect(getUsernameFromToken(token)).toBe("testuser");
  });

  it("should extract username from iss claim if sub is not present", () => {
    const payload = Buffer.from(JSON.stringify({ iss: "admin" })).toString("base64url");
    const token = `header.${payload}.signature`;
    expect(getUsernameFromToken(token)).toBe("admin");
  });

  it("should prefer sub over iss", () => {
    const payload = Buffer.from(JSON.stringify({ sub: "user1", iss: "user2" })).toString("base64url");
    const token = `header.${payload}.signature`;
    expect(getUsernameFromToken(token)).toBe("user1");
  });
});
