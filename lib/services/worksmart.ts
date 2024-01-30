import { LOCAL_STORAGE_KEY, LOCAL_STORAGE_ORG_ID } from "@/lib/constants";
import axios from "axios";
import { format } from "date-fns";
import {
  BillingSubscriptionResponse,
  BillingUsageResponse,
  OrganizationUsers,
  UsageResponse,
} from "../types";
import { env } from "@/env.mjs";

export class Worksmart {
  private static key: string | null = null;
  private static orgId: string | null = null;
  private pendingGetUsagePromise: Promise<UsageResponse> | null = null;

  constructor() {}

  static setKey(key: string | null) {
    Worksmart.key = key;
  }

  static setOrg(orgId: string | null) {
    Worksmart.orgId = orgId;
  }

  static getOrg() {
    return Worksmart.orgId;
  }

  static getKey() {
    return Worksmart.key;
  }

  static hasKey() {
    return !!Worksmart.key;
  }

  async getLogs({
    skip,
    pageSize,
  }: {
    skip: number;
    pageSize: number;
  }): Promise<any> {
    const query = { skip: `${skip}`, size: `${pageSize}` };
    try {
      const res = await axios.get(
        `${env.WORKSMART_API_URL}/v1/store/log?${new URLSearchParams(query)}`,
        {
          headers: {
            "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
            Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
          },
        }
      );

      return res.data;
    } catch (err) {
      throw err; // Re-throw the error to reject the Promise
    }
  }
  async getChannels(): Promise<any> {
    const query = {};
    try {
      const res = await axios.get(
        `${env.WORKSMART_API_URL}/v1/store/channel?${new URLSearchParams(
          query
        )}`,
        {
          headers: {
            "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
            Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
          },
        }
      );

      return res.data.data;
    } catch (err) {
      throw err; // Re-throw the error to reject the Promise
    }
  }

  async getBillingUsage(
    startDate: Date | string,
    endDate: Date | string
  ): Promise<BillingUsageResponse> {
    const key = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!key) throw new Error("Worksmart key not set");
    Worksmart.setKey(key.replaceAll('"', ""));

    const orgId = localStorage.getItem(LOCAL_STORAGE_ORG_ID);
    if (orgId) Worksmart.setOrg(orgId.replaceAll('"', ""));

    if (typeof startDate === "string") {
      startDate = new Date(startDate);
    }

    if (typeof endDate === "string") {
      endDate = new Date(endDate);
    }

    const query: {
      start_date: string;
      end_date: string;
    } = {
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
    };

    const res = await axios.get<BillingUsageResponse>(
      `https://api.dostow.com/store/dashboard/billing/usage?${new URLSearchParams(
        query
      )}`,
      {
        headers: {
          Authorization: `Bearer ${Worksmart.key}`,
          "Openai-Organization": Worksmart.orgId || "",
        },
      }
    );
    return res.data;
  }

  async getSubscription(): Promise<BillingSubscriptionResponse> {
    const key = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!key) throw new Error("Worksmart key not set");
    Worksmart.setKey(key.replaceAll('"', ""));

    const orgId = localStorage.getItem(LOCAL_STORAGE_ORG_ID);
    if (orgId) Worksmart.setOrg(orgId.replaceAll('"', ""));

    const response = await axios.get<BillingSubscriptionResponse>(
      `https://api.dostow.com/store/dashboard/billing/subscription`,
      {
        headers: {
          Authorization: `Bearer ${Worksmart.key}`,
          "Openai-Organization": Worksmart.orgId || "",
        },
      }
    );

    return response.data;
  }

  async getUsers(): Promise<OrganizationUsers> {
    const key = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!key) throw new Error("Worksmart key not set");
    Worksmart.setKey(key.replaceAll('"', ""));

    const response = await axios.get<OrganizationUsers>(
      `https://api.dostow.com/v1/store/organizations/${Worksmart.orgId}/users`,
      {
        headers: {
          Authorization: `Bearer ${Worksmart.key}`,
        },
      }
    );

    return response.data;
  }

  async isValidKey(key: string | null): Promise<boolean> {
    if (!key) {
      return false;
    }

    try {
      const response = await axios.get(
        `https://api.dostow.com/v1/store/subscription`,
        {
          headers: {
            Authorization: `Bearer ${key}`,

            // cache ttl 1 hr
            "Cache-Control": "max-age=3600",
          },
        }
      );

      return response.status === 200;
    } catch (e) {
      return false;
    }
  }
}

const worksmart = new Worksmart();

export default worksmart;
