import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import worksmart from "@/lib/services/worksmart";
import axios, { AxiosError } from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "You must be logged in." });
  }

  if (req.method === "GET") {
    const { id } = req.query;
    try {
      const devices: {
        code: string;
        message: string;
        results: {
          name: string;
          device: string;
        }[];
      } = await worksmart.getInstanceDevices(id as string);
      if (devices.results?.length > 0) {
        await worksmart.logoutInstance(id as string);
      }
      await worksmart.updateInstancePhone(id as string, "", "");
      return res.status(200).json({ ok: true });
    } catch (e) {
      const error = e as AxiosError<{ message: string; code: string }>;
      return res.status(400).json({ error: error?.response?.data.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
