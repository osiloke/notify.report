import { auth } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import worksmart from "@/lib/services/worksmart";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await auth();

  if (!session) {
    return res.status(401).json({ error: "You must be logged in." });
  }

  if (req.method === "GET") {
    const { id } = req.query;
    // fetch devices
    const devices: {
      code: string;
      message: string;
      results: {
        name: string;
        device: string;
      }[];
    } = await worksmart.getInstanceDevices(id as string);

    if (devices.results?.length > 0) {
      const d = devices.results[0];
      const phone = d.device.split("@")[0].split(":")[0];
      await worksmart.updateInstancePhone(id as string, phone, d.name);
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: "NOT_LOGGED_IN" });
  }
}
