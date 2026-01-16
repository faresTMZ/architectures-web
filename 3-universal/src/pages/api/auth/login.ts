import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;

  try {
    const response = await fetch("https://gourmet.cours.quimerch.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ username, password }).toString(),
      redirect: "manual",
    });

    // Get the jwt_token cookie from the API
    const setCookieHeader = response.headers.get("set-cookie");

    if (setCookieHeader) {
      // Extract the jwt_token value
      const tokenMatch = setCookieHeader.match(/jwt_token=([^;]+)/);
      if (tokenMatch) {
        const tokenValue = tokenMatch[1];
        // Store the JWT in our own cookie
        res.setHeader("Set-Cookie", `api_token=${tokenValue}; Path=/; HttpOnly; SameSite=Lax`);
        return res.status(200).json({ success: true, username });
      }
    }

    // Check if login failed
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Identifiants incorrects" }));
      return res.status(response.status).json(error);
    }

    res.status(401).json({ detail: "Login failed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
}
