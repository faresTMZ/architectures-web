import type { NextApiRequest, NextApiResponse } from "next";

function getApiToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/api_token=([^;]+)/);
  return match ? match[1] : null;
}

function getUsernameFromToken(token: string): string | null {
  try {
    // JWT is base64url encoded: header.payload.signature
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    return decoded.sub || decoded.iss || null;
  } catch {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const apiToken = getApiToken(req.headers.cookie);

  if (!apiToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const username = getUsernameFromToken(apiToken);
  if (!username) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    if (req.method === "POST") {
      const url = `https://gourmet.cours.quimerch.com/users/${username}/favorites?recipeID=${id}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Cookie: `jwt_token=${apiToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to add favorite" });
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === "DELETE") {
      const url = `https://gourmet.cours.quimerch.com/users/${username}/favorites?recipeID=${id}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Cookie: `jwt_token=${apiToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to remove favorite" });
      }

      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
