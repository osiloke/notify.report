import { auth } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "@/env.mjs";
import worksmart from "@/lib/services/worksmart";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await auth();

  if (!session) {
    return res.status(401).json({ error: "You must be logged in." });
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    const push = await worksmart.createPushPrivateChannel(
      id as string,
      req.body,
    );
    return res.status(200).json({ token: push.channels[0].token });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
