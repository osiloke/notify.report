// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { auth } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  user?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await auth()

  if (!session) {
    return res.status(401).json({ error: "You must be logged in." });
  }

  if (req.method === "GET") {
    // const user = await prisma.user.findUnique({
    //   where: {
    //     id: session.user.id,
    //   },
    //   include: {
    //     subscriptions: true,
    //     payments: true,
    //   },
    // });

    // if (!user) {
    //   return res.status(404).json({ error: "User not found." });
    // }

    res.status(200).json({ user: { ...session.user, subscriptions: [] } });
  }
}
