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
import { useUser } from "@/lib/hooks/user/useUser";
import { cn, fetcher } from "@/lib/utils";
import { Badge, Grid, TextInput, Title } from "@tremor/react";
import { m } from "framer-motion";
import { Check, Copy, Key, Send } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";

let tabs = [
  { id: "curl", label: "curl" },
  { id: "js", label: "javascript" },
  { id: "nodejs", label: "node.js" },
  { id: "python", label: "python" },
];

interface OnboardingProps {
  code: {
    curl: string;
    js: string;
    nodejs: string;
    python: string;
  };
  onRefresh?: () => void;
  className?: string;
  user_id?: boolean;
}

const LogsOnboarding = ({
  code,
  className,
  onRefresh = () => {},
  user_id = false,
}: OnboardingProps) => {
  const { user, isLoading, subscribed } = useUser();
  const {
    data: keys,
    error: keysError,
    isLoading: keysIsLoading,
  } = useSWR("/api/v1/keys", fetcher);
  const [step, setStep] = useState(1);
  const [key, setKey] = useState<{ key: string } | undefined>();
  let [activeTab, setActiveTab] = useState(tabs[0].id);
  const [plan, setPlan] = useState("free");
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState("***");

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  // useEffect(() => {

  useEffect(() => {
    if (keys?.keys.length > 0) {
      setKey(keys.keys[0]);
      setStep(2);
    }
  }, [keys]);
  //   if (step === 2 && subscribed) setStep(3);
  // }, [step, subscribed]);

  if (!user) return null;

  const handleSubmit = async () => {
    const res = await fetch("/api/v1/keys", {
      method: "POST",
      body: JSON.stringify({ name: "onboarding" }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();
    console.log(json);

    toast.success("Key generated successfully!");

    setStep(2);

    setKey(json.key);

    mutate("/api/v1/keys");
  };

  const handleLog = async () => {
    const res = await fetch("/api/v1/requests/send-demo", {
      method: "POST",
      body: JSON.stringify({
        ...(user_id && { user_id: "myuser@example.com" }),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();
    console.log(json);

    toast.success("Message sent successfully!");

    setStep(3);
    onRefresh();
  };

  return (
    <Suspense>
      <div className={cn("flex flex-col w-full max-w-xl space-y-4", className)}>
        <Grid numItems={1} className="gap-4 w-full">
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 flex-row items-center">
                <span>Logs</span>
                <Badge color="blue">✨ Free</Badge>
              </CardTitle>

              <CardDescription>( ~ 1 minute installation )</CardDescription>
              {/* <CardDescription>
                Building an AI product is hard. You probably wrote your prompt
                template once and then never changed it hoping for the best 😅.
                You also may not know how many times your AI model hallucinates,
                fails, or gives your users a terrible and unrelated answer.
              </CardDescription> */}
              <CardDescription className="font-semibold">
                Setup a whatsapp manager and wuuf api key to start automating
                messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* <video
                src="https://cdn.wuuf/openai-demo.mp4"
                autoPlay
                loop
                muted
                className="rounded-xl border"
              /> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row gap-4 items-center">
              <OnboardingStep step={1} currentStep={step} />
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
              "opacity-50 pointer-events-none": !key,
            })}
          >
            <CardHeader className="flex-row gap-4 items-center">
              <OnboardingStep step={2} currentStep={step} />
              <div className="flex flex-col justify-center gap-1.5">
                <Title>Send your first message</Title>
                <CardDescription>
                  Update your code using the examples below, or just press the
                  button!
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
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
              <Button onClick={handleLog}>
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </Button>
            </CardFooter>
          </Card>
        </Grid>
      </div>
    </Suspense>
  );
};

export default LogsOnboarding;
