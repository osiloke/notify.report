"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { mutate } from "swr";

const ChannelStarter = ({
  channel,
}: {
  channel: { id?: string; status?: string };
}) => {
  const fetchRef = useRef(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (fetchRef.current) return;
    fetchRef.current = true;
    setBusy(true);
    const resp = await fetch(`/api/v1/channels/${channel.id}/start`, {
      method: "GET",
    });
    if (!resp.ok) {
      setBusy(false);
      fetchRef.current = false;
    }
    mutate("/api/v1/channels");
  };

  if (!channel.id) return "";
  const isBusy = channel?.status == "creating" || busy;
  return (
    <>
      <Button
        disabled={isBusy}
        onClick={handleSubmit}
        variant="outline"
        className="py-2 leading-none px-3 font-medium text-green-600 hover:text-green-500 duration-150 hover:bg-gray-50 rounded-lg"
      >
        {isBusy ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <PlayCircle className="w-4 h-4" />
        )}
        &nbsp; Start Manager
      </Button>
    </>
  );
};

export default ChannelStarter;
