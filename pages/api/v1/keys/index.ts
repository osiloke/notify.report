import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import worksmart from "@/lib/services/worksmart";
import { createHash, randomBytes } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

const generateKey = (size: number = 32, format: BufferEncoding = "hex") => {
  const buffer = randomBytes(size);
  return buffer.toString(format);
};

export async function sha256(message: string) {
  const hash = createHash("sha256"); // Use createHash to create a hash object
  hash.update(message, "utf8"); // Update the hash with the message
  const hashHex = hash.digest("hex"); // Get the hash digest in hex format
  return hashHex;
}

const sensitizeKey = (key: string, numStars: number = 16) => {
  const stars = "*".repeat(numStars);
  return `${key.slice(0, 4)}${stars}${key.slice(-4)}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "You must be logged in." });
  }

  const { name } = req.body;

  if (req.method === "POST") {
    const key = await worksmart.createApiKey(session.user.id);
    return res.status(200).json({ key });
  } else if (req.method === "GET") {
    const keys = await worksmart.getApiKey(session.user.id);
    return res.status(200).json({
      keys: keys.map(({ access_key, created_at, id }) => ({
        name: "Default",
        key: access_key,
        sensitive_id: "Default",
        created_at,
        id,
      })),
    });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
