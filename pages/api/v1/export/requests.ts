import { auth } from "@/lib/auth";
import { parseISO } from "date-fns";
import { json2csv } from "json-2-csv";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await auth();
  if (!session) {
    return res.status(401).json({ error: "You must be logged in." });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: "Start and end dates are required" });
  }

  const startDate = parseISO(start as string);
  const endDate = parseISO(end as string);

  // Mock data for demonstration purposes
  const mockRequests = [
    {
      createdAt: "2024-06-01T12:00:00Z",
      id: "1",
      ip: "127.0.0.1",
      url: "/api/test",
      method: "GET",
      status: 200,
      cost: 0.01,
      cached: false,
      streamed: false,
      request_headers: {
        "x-metadata-user": "testuser",
        "x-metadata-role": "admin",
      },
      prompt: "Test prompt",
      completion: "Test completion",
      userId: session.user.id,
    },
    // Add more mock request objects as needed
  ];

  // Replace Prisma query with mock data filtering
  const requests = mockRequests.filter((request) => {
    const createdAt = new Date(request.createdAt);
    return (
      createdAt >= startDate &&
      createdAt <= endDate &&
      request.userId === session.user.id
    );
  });

  const filteredRequests = requests.map((request: any) => {
    const metadata = Object.entries(request.request_headers!).filter(
      ([key, _]) => key.startsWith("x-metadata"),
    );
    return {
      ...request,
      metadata,
    };
  });

  const csv = await json2csv(filteredRequests, {
    expandNestedObjects: false,
    keys: [
      "createdAt",
      "id",
      "ip",
      "url",
      "method",
      "status",
      "cost",
      "cached",
      "streamed",
      "metadata",
      "prompt",
      "completion",
    ],
  });

  // Send the CSV file to the client
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=requests.csv");
  res.status(200).send(csv);
}
