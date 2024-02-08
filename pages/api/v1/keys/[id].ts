import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import worksmart from "@/lib/services/worksmart";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

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
