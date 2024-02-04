import Docs from "@/app/(dashboard)/install/docs";
import KeysTable from "@/app/(dashboard)/install/keys-table";
import { sendMessageCode } from "@/lib/markdown-code";
import { Flex, Text, Title } from "@tremor/react";
import { Suspense } from "react";

export default async function Install() {
  const code = await sendMessageCode();

  return (
    <div className="max-w-4xl space-y-4">
      <Flex className="xl:flex-row flex-col items-start xl:items-center space-y-4">
        <div className="space-y-2">
          <div className="flex flex-row space-x-3">
            <Title>API Keys</Title>
          </div>
          <Text>Wuuf uses API keys to authenticate your requests.</Text>
        </div>
      </Flex>

      <Suspense fallback={<></>}>
        <KeysTable />
      </Suspense>

      <Suspense fallback={<></>}>
        <Docs code={code} />
      </Suspense>
    </div>
  );
}
