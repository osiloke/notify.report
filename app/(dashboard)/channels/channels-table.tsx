"use client";

import DeleteDialog from "@/app/(dashboard)/install/delete-dialog";
import KeyDialog from "@/app/(dashboard)/install/key-dialog";
import { fetcher } from "@/lib/utils";
import { Card } from "@tremor/react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

export default function ChannelsTable() {
  const router = useRouter();
  const { data, status } = useSession();
  if (status === "unauthenticated") {
    router.push("/");
  }

  const {
    data: channels,
    error,
    isLoading,
  } = useSWR("/api/v1/channels", fetcher);

  return (
    <Card className="shadow-none">
      <div className="overflow-scroll p-2">
        {data?.user && !isLoading && channels?.length > 0 && (
          <table className="w-full table-auto text-sm text-left">
            <thead className=" text-gray-600 font-medium border-b">
              <tr>
                <th className="py-3 px-6">Provider</th>
                <th className="py-3 px-6">Key</th>
                <th className="py-3 px-6">Created</th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y">
              {!isLoading &&
                channels.map((key: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {key.provider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {key.access_key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(key.created_at), "MMM dd, yyyy")}
                    </td>

                    <td className="text-right px-6 whitespace-nowrap">
                      {/* <DeleteDialog id={key.id} hashed={key.sensitive_id} /> */}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
        {/* <KeyDialog /> */}
      </div>
    </Card>
  );
}
