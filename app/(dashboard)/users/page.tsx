import UsersPage from "@/app/(dashboard)/users/users-page";
import { sendMessageCode } from "@/lib/markdown-code";

export default async function Users() {
  const code = await sendMessageCode();
  return <UsersPage code={code} />;
}
