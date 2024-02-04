import { env } from "@/env.mjs";
import { Centrifuge, Subscription } from "centrifuge";
import { useState, useEffect, useRef } from "react";

export async function setupPush(
  onConnect: Function,
  onDisconnect: Function,
  onMessage: (arg0: any) => void = () => {},
  args = {}
) {
  let client: Centrifuge;
  let subscription: Subscription;
  const credentials = await fetch("/api/v1/push", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((v) => v.json());
  const {
    private_channel,
    _realtime_token,
    id,
  }: { private_channel: string; _realtime_token: string; id: string } =
    credentials;
  client = new Centrifuge(env.NEXT_PUBLIC_REALTIME_URL, {
    // debug: true,
    token: _realtime_token,
  });
  subscription = client.newSubscription(private_channel, {
    getToken(ctx) {
      return fetch("/api/v1/push/" + id, {
        method: "PUT",
        body: JSON.stringify({ requested_channels: [ctx.channel] }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((v) => v.json())
        .then((rsp) => rsp.token);
    },
  });
  subscription.on("subscribing", function (ctx) {
    // console.log('subscribing', ctx);
  });

  subscription.on("subscribed", function (ctx) {
    onConnect(ctx);
  });

  subscription.on("unsubscribed", function (ctx) {
    console.log("unsubscribed", ctx);
  });

  subscription.on("error", function (ctx) {
    console.log("error", ctx);
  });
  subscription.on("publication", function (ctx) {
    onMessage(ctx);
  });
  subscription.subscribe();

  client.on("connecting", (ctx) => {
    // console.log('connecting', channelStore, channel, ctx);
  });
  client.on("connected", (ctx) => {
    onConnect(ctx);
  });
  client.on("disconnected", (ctx) => {
    onDisconnect(ctx);
    // client.connect()
  });
  client.on("error", (err) => {
    console.error(err);
  });
  client.connect();
  return client;
}

export function useRealtimeListener<T>(
  onMessage: ((arg0: { channel: string; data: T | any }) => void) | undefined
) {
  const [connected, setConnected] = useState(false);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    let current: Centrifuge;
    async function run() {
      try {
        current = await setupPush(
          () => {
            setConnected(true);
          },
          () => {
            setConnected(false);
          },
          onMessage
        );
      } catch (error) {
        // client.disconnect()
        // client.connect()
      }
    }
    run();
    return () => {
      if (current != null) current.disconnect();
    };
  }, []);
  return connected;
}
