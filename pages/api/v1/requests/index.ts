import { auth } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { formatQuery } from "react-querybuilder";
import { sha256 } from "../keys";
import worksmart from "@/lib/services/worksmart";

// Mock API keys for demonstration/testing purposes
const mockApiKeys = [
  { hashed_key: "mock_hashed_key_1", user: { id: "mock_user_id_1" } },
  { hashed_key: "mock_hashed_key_2", user: { id: "mock_user_id_2" } },
];

type QueryParameters = {
  user_id?: string;
  search?: string;
  sortBy?: keyof typeof sortingFields;
  sortOrder?: "asc" | "desc";
  pageSize?: number;
  pageNumber?: number;
  filter?: string;
};

const sortingFields = {
  id: "id",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ip: "ip",
  url: "url",
  method: "method",
  status: "status",
  cached: "cached",
};

// TODO: This is a hacky way to convert the react-querybuilder format to the prisma format
// Refer here to accomodate more operators:
// https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#json-filters
function convertToPrismaFormat(input: any) {
  const output: any = {};

  input.rules.forEach((rule: any) => {
    if (rule.operator === "=" && rule.valueSource === "value") {
      if (input.combinator === "and") {
        output.AND = output.AND || [];
        output.AND.push({
          request_headers: {
            path: [rule.field],
            string_contains: rule.value,
          },
        });
      } else if (input.combinator === "or") {
        output.OR = output.OR || [];
        output.OR.push({
          request_headers: {
            path: [rule.field],
            string_contains: rule.value,
          },
        });
      }
    }
  });

  return output;
}

const isEmpty = (obj: any) => {
  return Object.keys(obj).length === 0;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let userId = null as string | null;
  const session = await auth();

  if (!session) {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({
        error: "You must be logged in or provide an API key.",
      });
    }
    const user = await getUser(token);
    if (!user) {
      return res.status(401).json({
        error: "Invalid API key.",
      });
    }
    userId = user.id;
  } else {
    userId = session.user.id;
  }

  if (req.method === "GET") {
    const {
      user_id = "",
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      pageSize = 10,
      pageNumber = 1,
      filter = "{}",
    }: QueryParameters = req.query as unknown as QueryParameters;

    const skip = (Number(pageNumber) - 1) * Number(pageSize);

    const metadataFilter = convertToPrismaFormat(
      JSON.parse(
        formatQuery(JSON.parse(filter), {
          format: "json_without_ids",
          parseNumbers: true,
        }),
      ),
    );

    const searchFilter = search
      ? {
          OR: [
            {
              request_body: {
                path: ["$.prompt"],
                string_contains: `${search}`,
              },
            },
            {
              request_body: {
                path: ["$.messages[*].content"],
                array_contains: `${search}`,
              },
            },
            {
              completion: {
                contains: `${search}`,
                mode: "insensitive",
              },
            },
          ] as any[],
        }
      : {};

    const data = await worksmart.getLogs(session!.user.id, { skip, pageSize });
    const requests = data.data;
    const totalCount = data.total_count;
    return res.status(200).json({
      requests: requests.map(
        (v: { message?: { text: string }; channel_provider: string }) => ({
          ...v,
          url: "https://api.vazapay.com/v1/wuuf/message",
          completion: v.message?.text ?? "",
          request_body: v.message?.text ?? "",
          model: v.channel_provider,
          request_headers: {},
        }),
      ),
      totalCount,
    });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

const getBearerToken = (request: NextApiRequest) => {
  const headers = request.headers;
  const authorizationHeader = headers.authorization;

  if (!authorizationHeader) return null;
  const token = authorizationHeader.replace("Bearer ", "");
  return token;
};

const getUser = async (apiKey: string) => {
  const hashedApiKey = await sha256(apiKey);
  const key = mockApiKeys.find((k) => k.hashed_key === hashedApiKey);
  return key?.user;
};
