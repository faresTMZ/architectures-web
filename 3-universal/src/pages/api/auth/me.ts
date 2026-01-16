import type { NextApiRequest, NextApiResponse } from "next";

function getApiToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/api_token=([^;]+)/);
  return match ? match[1] : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiToken = getApiToken(req.headers.cookie);

  if (!apiToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const response = await fetch("https://gourmet.cours.quimerch.com/me", {
      headers: {
        Cookie: `jwt_token=${apiToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
}
