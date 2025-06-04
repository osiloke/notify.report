import { auth } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "@/env.mjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await auth();

  if (!session) {
    return res.status(401).json({ error: "You must be logged in." });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;

    // return res.status(200).json({ key });
    return res.status(405).json({ error: "Method not allowed" });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
