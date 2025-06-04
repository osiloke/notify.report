import { auth } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await auth();

  if (!session) {
    return res.status(401).json({ error: "You must be logged in." });
  }

  if (req.method === "PUT") {
    const { id, name } = req.query;

    return res.status(200).json({ id, name });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
