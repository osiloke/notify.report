import { authOptions } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "You must be logged in." });
  }

  if (req.method === "GET") {
    // Mock data for demonstration; replace with actual Prisma query as needed
    const mockRequests = [
      { userId: session.user.id, user_id: 1 },
      { userId: session.user.id, user_id: 2 },
      { userId: "otherUser", user_id: 3 },
      { userId: session.user.id, user_id: null },
    ];
    const totalCount = mockRequests.filter(
      (request) =>
        request.userId === session.user.id && request.user_id !== null,
    ).length;

    console.log(totalCount);

    return res.status(200).json({
      totalCount,
    });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
