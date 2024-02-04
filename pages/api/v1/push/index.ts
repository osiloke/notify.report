import { authOptions } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import worksmart from "@/lib/services/worksmart";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "You must be logged in." });
  }

  if (req.method === "GET") {
    const push = await worksmart.createPushSession({
      group: "user",
      key: session.user.id,
    });
    return res.status(200).json(push);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
