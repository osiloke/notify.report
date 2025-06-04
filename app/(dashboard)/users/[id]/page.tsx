import RequestTable from "@/components/RequestTable";
import UserCostPerDayChart from "@/components/users/UserCostPerDayChart";
import { Card, Col, Grid, Subtitle, Title } from "@tremor/react";
import { Suspense } from "react";

export default async function User({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams.id;
  return (
    <Grid numItems={3} className="gap-4 w-full">
      <Col numColSpan={3}>
        <Card className="shadow-none">
          <Title>{decodeURIComponent(id)}</Title>
          <Subtitle>Detailed insights about the user</Subtitle>
        </Card>
      </Col>
      <Col numColSpan={3}>
        <Card className="shadow-none">
          <Title>Cost</Title>
          <Subtitle>The total cost for user per day</Subtitle>
          <Suspense fallback={<>loading...</>}>
            <UserCostPerDayChart userId={id} />
          </Suspense>
        </Card>
      </Col>
      <Col numColSpan={3}>
        <Card className="shadow-none">
          <Title>Logs</Title>
          <Suspense fallback={<>loading...</>}>
            <RequestTable userId={id} />
          </Suspense>
        </Card>
      </Col>
    </Grid>
  );
}
