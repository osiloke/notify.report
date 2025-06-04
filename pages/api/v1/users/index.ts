import { auth } from "@/lib/auth";
import { calculateCost } from "@/lib/llm/calculateCost";
import { Snapshot } from "@/lib/types";
import { endOfDay, startOfDay } from "date-fns";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

interface MockRequest {
  user_id: string | null;
  model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  createdAt: Date; // Add createdAt for date filtering
}

// Mock data store
const mockRequests: MockRequest[] = [
  {
    user_id: "user1",
    model: "gpt-3.5-turbo",
    prompt_tokens: 100,
    completion_tokens: 50,
    createdAt: new Date("2023-10-26T10:00:00Z"),
  },
  {
    user_id: "user2",
    model: "gpt-4",
    prompt_tokens: 200,
    completion_tokens: 100,
    createdAt: new Date("2023-10-26T11:00:00Z"),
  },
  {
    user_id: "user1",
    model: "gpt-3.5-turbo",
    prompt_tokens: 150,
    completion_tokens: 75,
    createdAt: new Date("2023-10-27T10:00:00Z"),
  },
  {
    user_id: "user3",
    model: "gpt-4",
    prompt_tokens: 300,
    completion_tokens: 150,
    createdAt: new Date("2023-10-27T12:00:00Z"),
  },
  {
    user_id: "user2",
    model: "gpt-3.5-turbo",
    prompt_tokens: 120,
    completion_tokens: 60,
    createdAt: new Date("2023-10-28T09:00:00Z"),
  },
];

const dateSchema = z
  .string()
  .refine(
    (value) => {
      const [year, month, day] = value.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return !isNaN(date.getTime());
    },
    {
      message: "Invalid date format, expected 'yyyy-MM-dd'",
    },
  )
  .transform((value) => {
    const [year, month, day] = value.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  });

const QueryParameters = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["id", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  pageSize: z.coerce.number().optional(),
  pageNumber: z.coerce.number().optional(),
  filter: z.string().optional(),
  start: dateSchema.optional(),
  end: dateSchema.optional(),
});

const sortingFields = {
  id: "id",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await auth();

  if (!session) {
    return res.status(401).json({ error: "You must be logged in." });
  }

  if (req.method === "GET") {
    try {
      const {
        search = "",
        sortBy = "createdAt",
        sortOrder = "desc",
        pageSize = 10,
        pageNumber = 1,
        filter = "{}",
        start = "",
        end = "",
      } = QueryParameters.parse(req.query);

      // const skip = (Number(pageNumber) - 1) * Number(pageSize);
      const where = JSON.parse(filter);
      const searchFilter = search
        ? {
            OR: [
              {
                user_id: {
                  search,
                },
              },
            ],
          }
        : {};

      const dateFilter: Partial<{
        createdAt?: {
          gte?: Date;
          lte?: Date;
        };
      }> = {};

      if (start || end) {
        dateFilter.createdAt = {};
        if (start) {
          dateFilter.createdAt.gte = startOfDay(start);
        }
        if (end) {
          dateFilter.createdAt.lte = endOfDay(end);
        }
      }

      // Replace Prisma query with mock data filtering and sorting
      let requests = mockRequests.filter(
        (request) => request.user_id === session.user.id,
      );

      // Apply date filter
      if (dateFilter.createdAt) {
        requests = requests.filter((request) => {
          if (dateFilter.createdAt?.gte && dateFilter.createdAt?.lte) {
            return (
              request.createdAt >= dateFilter.createdAt.gte &&
              request.createdAt <= dateFilter.createdAt.lte
            );
          } else if (dateFilter.createdAt?.gte) {
            return request.createdAt >= dateFilter.createdAt.gte;
          } else if (dateFilter.createdAt?.lte) {
            return request.createdAt <= dateFilter.createdAt.lte;
          }
          return true;
        });
      }

      // Apply search filter (basic user_id search for mock data)
      if (searchFilter.OR) {
        requests = requests.filter((request) =>
          searchFilter.OR.some(
            (filter: any) =>
              filter.user_id?.search &&
              request.user_id?.includes(filter.user_id.search),
          ),
        );
      }

      // Apply sorting (basic sorting for mock data)
      requests.sort((a, b) => {
        const aValue = (a as any)[sortBy];
        const bValue = (b as any)[sortBy];
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      const filteredUsers: (MockRequest & { cost: number })[] = requests
        .filter(
          (request: MockRequest) =>
            request.user_id !== null &&
            request.user_id !== "" &&
            request.model !== null &&
            request.prompt_tokens !== null &&
            request.completion_tokens !== null,
        )
        .map((request: MockRequest) => {
          return {
            ...request,
            cost: calculateCost({
              model: request.model as Snapshot,
              input: request.prompt_tokens!,
              output: request.completion_tokens!,
            }),
          };
        });

      const users = filteredUsers.reduce(
        (
          acc: {
            [key: string]: {
              user_id: string;
              total_requests: number;
              total_prompt_tokens: number;
              total_completion_tokens: number;
              total_cost: number;
            };
          },
          user,
        ) => {
          if (!user.user_id) return acc;

          if (!acc[user.user_id]) {
            acc[user.user_id] = {
              user_id: user.user_id,
              total_cost: 0,
              total_requests: 0,
              total_prompt_tokens: 0,
              total_completion_tokens: 0,
            };
          }

          acc[user.user_id].total_cost += user.cost;
          acc[user.user_id].total_requests += 1;
          acc[user.user_id].total_prompt_tokens += user.prompt_tokens!;
          acc[user.user_id].total_completion_tokens += user.completion_tokens!;

          return acc;
        },
        {},
      );

      const sortedUsers = Object.values(users).sort(
        (a, b) => b.total_cost - a.total_cost,
      );

      const skip = (Number(pageNumber) - 1) * Number(pageSize);
      const take = Number(pageSize);
      const paginatedUsers = sortedUsers.slice(skip, skip + take);

      const totalCount = sortedUsers.length;

      return res.status(200).json({
        users: paginatedUsers,
        totalCount,
      });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
