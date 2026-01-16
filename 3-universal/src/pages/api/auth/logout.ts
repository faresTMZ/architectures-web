import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Clear the api_token cookie
  res.setHeader("Set-Cookie", "api_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly");
  res.status(200).json({ success: true });
}
