"use client";

import { fetcher } from "@/lib/utils";
import { BadgeDelta, Card, Badge } from "@tremor/react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import RegisterPhoneDialog from "./channel-login-dialog";
import ChannelDeleteDialog from "./channel-delete-dialog";
import { ClockIcon, StopCircle } from "lucide-react";
import { useRealtimeListener } from "@/lib/hooks/useRealtimeListener";
import ChannelDialog from "./channel-dialog";
import ChannelDiscardDialog from "./channel-discard-dialog";
import ChannelStarter from "./channel-starter";
import { Suspense } from "react";
import ChannelOnboarding from "./channel-onboarding";
import ChannelUnlinkDialog from "./channel-unlink-dialog";

interface ChannelsTableProps {
  code: {
    curl: string;
    js: string;
    nodejs: string;
    python: string;
  };
}

const ChannelStatus = ({ status }: { status: string }) => {
  switch (status) {
    case "discarded":
      return <Badge icon={StopCircle}>{"Stopped"}</Badge>;
    case "creating":
      return <Badge icon={ClockIcon}>{status}</Badge>;
    case "running":
      return (
        <Badge color="green" icon={ClockIcon}>
          {status}
        </Badge>
      );
    default:
      return <BadgeDelta deltaType="unchanged">{status}</BadgeDelta>;
  }
};
export default function ChannelsTable({ code }: ChannelsTableProps) {
  const router = useRouter();
  const { data, status } = useSession();
  if (status === "unauthenticated") {
    router.push("/");
  }

  useRealtimeListener<{ message: string; metadata: any }>((msg) => {
    const { data } = msg;
    // toast.success(data.message);
    mutate("/api/v1/channels");
  });

  const {
    data: channels,
    error,
    isLoading,
  } = useSWR("/api/v1/channels", fetcher);

  const onRefresh = async () => {
    mutate("logCount");
  };

  return (
    <>
      <ChannelOnboarding
        code={code}
        channels={channels || []}
        onRefresh={onRefresh}
      />
      {channels?.length > 0 && (
        <>
          <Card className="shadow-none">
            <div className="overflow-scroll p-2">
              {data?.user && !isLoading && channels?.length > 0 && (
                <table className="w-full table-auto text-sm text-left">
                  <thead className=" text-gray-600 font-medium border-b">
                    <tr>
                      <th className="py-3 px-6">Name</th>
                      <th className="py-3 px-6">Phone</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6">Date Created</th>
                      <th className="py-3 px-6"></th>
                      <th className="py-3 px-6"></th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 divide-y">
                    {!isLoading &&
                      channels.map((channel: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {channel.name}
                          </td>
                          {channel.phone && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              {channel.phone}
                            </td>
                          )}
                          {!channel.phone && channel.status != "running" && (
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              Not registered
                            </td>
                          )}
                          {!channel.phone && channel.status == "running" && (
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              <RegisterPhoneDialog
                                id={channel.id}
                                channel={channel}
                              />
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <ChannelStatus status={channel.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {format(
                              new Date(channel.created_at),
                              "MMM dd, yyyy"
                            )}
                          </td>

                          <td className="text-right px-6 whitespace-nowrap space-x-4">
                            {["discarding", "discarded"].includes(
                              channel.status
                            ) && <ChannelStarter channel={channel ?? {}} />}
                            {["running", "creating"].includes(
                              channel.status
                            ) && (
                              <ChannelDiscardDialog channel={channel ?? {}} />
                            )}
                            {channel?.phone && (
                              <ChannelUnlinkDialog channel={channel ?? {}} />
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
              <ChannelDialog channels={channels} />
            </div>
          </Card>
        </>
      )}
    </>
  );
}
