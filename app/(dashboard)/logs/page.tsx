import LogsPage from "@/app/(dashboard)/logs/logs-page";
import { getSendCode } from "@/lib/markdown-code";

export default async function Logs() {
  const code = await getSendCode();
  return <LogsPage code={code} />;
}
