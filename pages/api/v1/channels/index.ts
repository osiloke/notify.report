import { authOptions } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { env } from "@/env.mjs";
import worksmart from "@/lib/services/worksmart";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "You must be logged in." });
  }

  if (req.method === "POST") {
    const { name } = req.body;
    const instance = await worksmart.createInstance(
      session.user.id,
      name,
      "whatsapp"
    );
    return res.status(200).json({ instance });
  } else if (req.method === "GET") {
    const channels = await worksmart.getInstances(session.user.id);
    return res.status(200).json(
      channels.map(({ name, status, user_id, phone, created_at, id }) => ({
        id,
        name,
        status,
        user_id,
        phone,
        created_at,
      }))
    );
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
