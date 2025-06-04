import { auth } from "@/lib/auth";
import worksmart from "@/lib/services/worksmart";
import type { NextApiRequest, NextApiResponse } from "next";

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
    await worksmart.deleteApiKey(id as string, session.user.id);
    return res.status(200).json({ key: { id } });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
