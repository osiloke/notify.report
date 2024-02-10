import ChannelsTable from "@/app/(dashboard)/channels/channels-page";
import { Flex, Text, Title } from "@tremor/react";
import { Suspense } from "react";
import { getSendCode } from "@/lib/markdown-code";

export default async function Install() {
  const code = await getSendCode();
  return (
    <div className="max-w-4xl space-y-4">
      <Flex className="xl:flex-row flex-col items-start xl:items-center space-y-4">
        <div className="space-y-2">
          <div className="flex flex-row space-x-3">
            <Title>Whatsapp Managers</Title>
          </div>
          <Text>
            Whatsapp managers are used to automate messages sent to and from a
            whatsapp business phone number.
          </Text>
        </div>
      </Flex>
      <Suspense fallback={<></>}>
        <>
          <ChannelsTable code={code} />
        </>
      </Suspense>
    </div>
  );
}
