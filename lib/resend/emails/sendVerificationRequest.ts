import { env } from "@/env.mjs";
import { SendVerificationRequestParams } from "next-auth/providers";

export const sendVerificationRequest = async (
  params: SendVerificationRequestParams,
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (env.MAILMORE_API_KEY) {
    headers["x-dostow-group-access-key"] = env.MAILMORE_API_KEY;
  }

  /**
   * Converts a duration in seconds to a human-readable string.
   * @param seconds The duration in seconds.
   * @returns A human-readable string representation of the duration.
   */
  function formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    } else {
      const days = Math.floor(seconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"}`;
    }
  }
  // Convert expires (Date) to a duration in seconds from now
  const now = Date.now();
  let expiresAtTimestamp: number;

  if (typeof params.expires === "string") {
    const date = new Date(params.expires);
    if (isNaN(date.getTime())) {
      // Log a warning for invalid date string and default duration to 0
      console.warn(
        "Invalid expires date string provided. Defaulting duration to 0.",
        { expires: params.expires },
      );
      expiresAtTimestamp = now; // Setting to now results in duration 0
    } else {
      expiresAtTimestamp = date.getTime();
    }
  } else {
    // Assuming params.expires is a valid Date object if not a string
    expiresAtTimestamp = params.expires.getTime();
  }

  // Calculate duration in seconds, ensuring it's not negative
  const durationInSeconds = Math.max(
    0,
    Math.floor((expiresAtTimestamp - now) / 1000),
  );

  // Convert duration to human-readable format
  const duration = formatDuration(durationInSeconds);

  const response = await fetch("https://api.dostow.com/v1/store/email", {
    method: "POST",
    headers,
    body: JSON.stringify({
      recipient: params.identifier,
      template_name: "'otp-email'",
      sender: env.RESEND_FROM_ADDRESS,
      subject: "Verify your email address",
      data: {
        token: params.token,
        email: params.identifier,
        duration, // duration in seconds
        url: params.url,
        baseUrl: env.NEXTAUTH_URL,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(
      "Failed to send verification email:",
      response.status,
      errorData,
    );
    throw new Error(`Failed to send verification email: ${response.status}`);
  }
};
