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
      const qr = await worksmart.createInstanceQR(id as string);
      return res.status(200).json(qr);
    } catch (e) {
      const error = e as AxiosError<{ message: string; code: string }>;
      if (error?.response?.data.code == "ALREADY_LOGGED_IN") {
        // TODO: all this should be done in worksmart using sync and a store specifically for instance tasks
        // fetch devices
        const devices: {
          code: string;
          message: string;
          results: {
            name: string;
            device: string;
          }[];
        } = await worksmart.getInstanceDevices(id as string);

        if (devices.results.length > 0) {
          const d = devices.results[0];
          const phone = d.device.split("@")[0].split(":")[0];
          await worksmart.updateInstancePhone(id as string, phone, d.name);
          return res.status(400).json({ error: "LOGGED_IN" });
        }
        return res.status(400).json({ error: error?.response?.data.message });
      }
      return res.status(500).json({ error: "failed" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
