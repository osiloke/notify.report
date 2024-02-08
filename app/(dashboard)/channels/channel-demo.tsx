"use client";

import { OnboardingStep } from "@/components/onboarding/Step";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/hooks/user/useUser";
import { cn, fetcher } from "@/lib/utils";
import {
  Badge,
  Flex,
  Grid,
  NumberInput,
  Text,
  TextInput,
  Title,
} from "@tremor/react";
import { m } from "framer-motion";
import { Check, Copy, Key, Send } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";
import ChannelDialog from "./channel-dialog";
import RegisterPhoneDialog from "./register-phone-dialog";
import ChannelStarter from "./channel-starter";
import { RocketIcon } from "@radix-ui/react-icons";
import { Icons } from "@/components/icons";

let tabs = [
  { id: "curl", label: "curl" },
  { id: "js", label: "javascript" },
  { id: "nodejs", label: "node.js" },
  { id: "python", label: "python" },
];

interface Channel {
  id: string;

  name: string;
  phone: string;
  status: string;
}

interface ChannelDemoProps {
  code: {
    curl: string;
    js: string;
    nodejs: string;
    python: string;
  };
  channels: Channel[];
  onRefresh?: () => void;
  className?: string;
  user_id?: boolean;
}

const ChannelDemo = ({
  code,
  channels,
  className,
  onRefresh = () => {},
  user_id = false,
}: ChannelDemoProps) => {
  const {
    data: keys,
    error: keysError,
    isLoading: keysIsLoading,
  } = useSWR("/api/v1/keys", fetcher);
  const { user, isLoading, subscribed } = useUser();
  const [step, setStep] = useState(1);
  const [key, setKey] = useState<{ key: string }>();
  let [activeTab, setActiveTab] = useState(tabs[0].id);
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);
  const [channel, setChannel] = useState<Channel>();

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  useEffect(() => {
    if (keys?.keys?.length > 0) {
      setKey(keys.keys[0]);
    }
    if (channels.length == 0) {
      setStep(1);
    } else if (channels.length > 0 && keys?.keys.length > 0) {
      setStep(3);
    } else if (channels.length > 0) {
      setStep(2);
    }
  }, [channels, keys]);

  useEffect(() => {
    if (channels.length > 0) {
      setChannel(channels[0]);
    }
  }, [channels]);

  if (!user) return null;

  if (keysIsLoading && keys?.length == 0) return null;

  const handleSubmit = async () => {
    const res = await fetch("/api/v1/keys", {
      method: "POST",
      body: JSON.stringify({ name: "ChannelDemo" }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();

    if (json.error) {
    } else {
      toast.success("API Key created successfully!");

      setStep(3);

      setKey(json.key);

      mutate("/api/v1/keys");
    }
  };

  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    setSending(true);
    const res = await fetch("/api/v1/requests/send-demo", {
      method: "POST",
      body: JSON.stringify({ phone, key: key?.key }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();
    setSending(false);
    if (json.error) {
      toast.error(json.error);
    } else {
      toast.success("First Message sent successfully!");

      setStep(4);
      onRefresh();
    }
  };

  const setPhoneNumber = (e: any) => {
    setPhone(e.target.value);
  };

  const channelReady = channel?.phone.length && channel?.status == "running";

  return (
    <Suspense>
      <div className={cn("flex flex-col w-full space-y-4", className)}>
        <Grid numItems={1} className="gap-4 w-full">
          <Card>
            <CardHeader className="flex-row gap-4 items-center">
              <OnboardingStep step={1} currentStep={step} />
              <div className="flex flex-col justify-center gap-1.5">
                <CardTitle>Create a whatsapp manager</CardTitle>
                <CardDescription>
                  A manager automates sending and receiving on a single whatsapp
                  phone number.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-x-4">
              {channel?.status != "running" && (
                <ChannelStarter channel={channel ?? {}} />
              )}

              {channel?.status == "running" && channel?.phone.length === 0 && (
                <RegisterPhoneDialog id={channel?.id ?? ""} channel={channel} />
              )}

              {channelReady == true && (
                <Flex justifyContent="start" className="gap-4">
                  <RocketIcon className="h-4 w-4" />
                  <Text>Your whatsapp manager is ready !</Text>
                </Flex>
              )}
            </CardContent>
            <CardFooter>
              {channels.length === 0 && <ChannelDialog channels={[]} />}
            </CardFooter>
          </Card>
          <Card
            className={cn("", {
              "opacity-50 pointer-events-none": !channelReady || !key,
            })}
          >
            <CardHeader className="flex-row gap-4 items-center">
              <OnboardingStep step={2} currentStep={step} />
              <div className="flex flex-col justify-center gap-1.5">
                <CardTitle>Create a wuuf API key</CardTitle>
                <CardDescription>
                  This key will be used to identify your requests so that you
                  can view your logs in the dashboard.
                </CardDescription>
              </div>
            </CardHeader>
            {key && (
              <CardContent>
                <TextInput
                  type="password"
                  name="name"
                  value={key.key}
                  onChange={() => {}}
                  className="w-full px-2 py-1 text-gray-500 bg-transparent outline-none border shadow-sm rounded-lg"
                />
              </CardContent>
            )}
            <CardFooter>
              {!key && (
                <Button onClick={handleSubmit}>
                  <Key className="w-4 h-4 mr-2" />
                  <span>Create API Key</span>
                </Button>
              )}

              {key && (
                <Button
                  className="gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(key.key);
                    toast.success("Copied to clipboard!");
                    setCopied(true);
                  }}
                >
                  {copied && <Check className="w-4 h-4" />}
                  {!copied && <Copy className="w-4 h-4" />}
                  <span>Copy to Clipboard</span>
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card
            className={cn("", {
              "opacity-50 pointer-events-none": !channelReady || !key,
            })}
          >
            <CardHeader className="flex-row gap-4 items-center">
              <OnboardingStep step={3} currentStep={step} />
              <div className="flex flex-col justify-center gap-1.5">
                <Title>Send your first message</Title>
                <CardDescription>
                  Update your code using the examples below, or just press the
                  button!
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="py-4">
                <Label>Phone number</Label>
                <NumberInput
                  enableStepper={false}
                  placeholder="2340000000000"
                  onChange={setPhoneNumber}
                />
              </div>
              <div className="mt-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id ? "" : "hover:text-black/60"
                    } relative rounded-full px-3 py-1.5 text-sm font-medium text-black outline-sky-400 transition focus-visible:outline-2`}
                    style={{
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {activeTab === tab.id && (
                      <m.span
                        layoutId="bubble"
                        className="absolute inset-0 z-10 bg-white mix-blend-difference"
                        style={{ borderRadius: 9999 }}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 space-y-2">
                <m.div
                  className="md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  dangerouslySetInnerHTML={{
                    __html:
                      activeTab === "curl"
                        ? code.curl
                            .replace(
                              "$WUUF_API_KEY",
                              key?.key || "$WUUF_API_KEY"
                            )
                            .replace("2347000000000", phone || "***")
                        : activeTab === "js"
                        ? code.js
                            .replace(
                              "${process.env.WUUF_API_KEY}",
                              key?.key || "${process.env.WUUF_API_KEY}"
                            )
                            .replace("2347000000000", phone || "***")
                        : activeTab === "nodejs"
                        ? code.nodejs
                            .replace(
                              "${process.env.WUUF_API_KEY}",
                              key?.key || "${process.env.WUUF_API_KEY}"
                            )
                            .replace("2347000000000", phone || "***")
                        : activeTab === "python"
                        ? code.python
                            .replace(
                              "WUUF_API_KEY",
                              key?.key
                                ? `'${key?.key}'`
                                : 'os.getenv("WUUF_API_KEY")'
                            )
                            .replace("2347000000000", phone || "***")
                        : "",
                  }}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={sendMessage} disabled={sending}>
                {sending ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Message
              </Button>
            </CardFooter>
          </Card>
        </Grid>
      </div>
    </Suspense>
  );
};

export default ChannelDemo;
