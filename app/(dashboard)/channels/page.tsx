import ChannelsTable from "@/app/(dashboard)/channels/channels-table";
import { Flex, Text, Title } from "@tremor/react";
import { Suspense } from "react";

export default async function Install() {
  return (
    <div className="max-w-4xl space-y-4">
      <Flex className="xl:flex-row flex-col items-start xl:items-center space-y-4">
        <div className="space-y-2">
          <div className="flex flex-row space-x-3">
            <Title>Messaging Channels</Title>
          </div>
          <Text>Here a list of your channels.</Text>
        </div>
      </Flex>

      <Suspense fallback={<></>}>
        <ChannelsTable />
      </Suspense>
    </div>
  );
}
