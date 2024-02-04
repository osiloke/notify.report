import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import worksmart from "@/lib/services/worksmart";
import { AxiosError } from "axios";
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

  if (req.method === "POST") {
    const { phone, key } = req.body || null;
    try {
      const request = await worksmart.sendWhatsappMessage(
        phone,
        "wuuf wuuf 🐶",
        key
      );
      return res.status(200).json({
        request,
      });
    } catch (error) {
      const e = error as AxiosError<{
        error?: string;
        errors?: { msg: string }[];
        msg?: string;
      }>;
      if (e.response?.data?.error) {
        return res.status(400).json({ error: e.response?.data?.error });
      }
      if (e.response?.data.errors?.length) {
        return res.status(400).json({ error: e.response?.data.errors[0].msg });
      }
      return res.status(400).json({ error: "failed" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
