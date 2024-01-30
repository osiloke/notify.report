"use client";

import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";
import Link from "next/link";

const features = [
  {
    id: "feature-pricing",
    header: "Pricing",
    name: "Transparent Pricing",
    description:
      "Wuuf keeps it simple. Enjoy straightforward pricing that lets you focus on your business, not complex fee structures.",
    icon: Icons.openai,
    // video: "https://cdn.wuuf/openai-demo.mp4",
    cta: "Get Started",
    href: "/login",
    reverse: false,
  },
  {
    id: "feature-logs",
    header: "Optimize",
    name: "Logs and Reporting",
    description:
      "Gain valuable insights into your communication strategy with Wuuf's robust analytics tools. Track message delivery and user engagement to refine and optimize your approach.",
    icon: List,
    // video: "https://cdn.wuuf/logs-demo.mp4",
    cta: "Get Started",
    href: "/login",
    reverse: true,
  },
  {
    id: "feature-ai",
    header: "LLM & AI",
    name: "AI Integration",
    description:
      "Dive into the AI revolution with Wuuf's cutting-edge tools. Leverage AI to supercharge your automation efforts, making your workflow smarter and more effective.",
    icon: Icons.user,
    // video: "https://cdn.wuuf/users-demo.mp4",
    cta: "Get Started",
    href: "/login",
    reverse: false,
  },
];

const FeatureSections = () => {
  return (
    <>
      {features.map((feature) => (
        <section id={feature.id} key={feature.id}>
          <div className="mx-auto px-6 py-6 sm:py-20">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-16 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-5">
              <div
                className={cn("m-auto lg:col-span-2", {
                  "lg:order-last": feature.reverse,
                })}
              >
                <h2 className="text-base font-semibold leading-7 text-teal-600">
                  {feature.header}
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  {feature.name}
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  {feature.description}
                </p>
                <Link
                  className={cn(
                    buttonVariants({
                      variant: "default",
                      size: "lg",
                    }),
                    "mt-8"
                  )}
                  href={feature.href}
                >
                  {feature.cta}
                </Link>
              </div>
              <video
                // src={feature.video}
                // autoPlay
                // loop
                // muted
                className="rounded-xl border m-auto lg:col-span-3 shadow-2xl"
              />
            </div>
          </div>
        </section>
      ))}
    </>
  );
};

export default FeatureSections;
