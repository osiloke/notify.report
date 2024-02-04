"use client";

import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { mutate } from "swr";

const ChannelStarter = ({ id, hashed }: { id: string; hashed: string }) => {
  const handleSubmit = async () => {
    toast.promise(
      fetch(`/api/v1/channels/${id}/start`, {
        method: "GET",
      }),
      {
        loading: "Busy...",
        error: "Please try again",
        success: "Manager started successfully!",
      }
    );

    mutate("/api/v1/channels");
  };

  return (
    <>
      <Button
        onClick={handleSubmit}
        variant="outline"
        className="py-2 leading-none px-3 font-medium text-green-600 hover:text-green-500 duration-150 hover:bg-gray-50 rounded-lg"
      >
        <PlayCircle className="w-4 h-4" />
        &nbsp; Start Manager
      </Button>
    </>
  );
};

export default ChannelStarter;
