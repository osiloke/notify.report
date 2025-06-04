import axios, { AxiosError } from "axios";
import { Instance } from "../types";
import { env } from "@/env.mjs";
import { VerificationToken } from "next-auth/adapters";

export class Worksmart {
  constructor() {
    // Add response interceptor to log errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error)) {
          console.error("Axios error response:", {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.config?.headers,
          });
        }
        return Promise.reject(error);
      },
    );
  }

  private getHeaders() {
    return {
      // "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
      // Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
      "X-DOSTOW-GROUP-ACCESS-KEY": env.WORKSMART_API_KEY,
    };
  }

  async getLogs(
    user_id: string,
    {
      skip,
      pageSize,
    }: {
      skip: number;
      pageSize: number;
    },
  ): Promise<any> {
    const query = {
      skip: `${skip}`,
      size: `${pageSize}`,
      q: `{"user_id": "${user_id}"}`,
    };
    const res = await axios.get(
      `${env.WORKSMART_API_URL}/v1/store/log?${new URLSearchParams(query)}`,
      {
        headers: this.getHeaders(),
      },
    );

    return res.data;
  }
  async getUser(email: string): Promise<any> {
    const query = { q: `{"Email":"${email}"}` };
    try {
      const res = await axios.get(
        `${env.WORKSMART_API_URL}/v1/store/user?${new URLSearchParams(query)}`,
        {
          headers: this.getHeaders(),
        },
      );
      if (res.data.data.length > 0) {
        return res.data.data[0];
      }
      return null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error(
          "Worksmart API returned 401. Attempting to refresh token.",
          error,
        );
        try {
          const newToken = await this.refreshToken();
          // TODO: Implement mechanism to update the stored WORKSMART_AUTH_TOKEN with the new token
          // For now, retry the request with the new token directly
          const retryRes = await axios.get(
            `${env.WORKSMART_API_URL}/v1/store/user?${new URLSearchParams(
              query,
            )}`,
            {
              headers: {
                ...this.getHeaders(),
                Authorization: `Bearer ${newToken}`,
              },
            },
          );
          if (retryRes.data.data.length > 0) {
            return retryRes.data.data[0];
          }
          return null;
        } catch (refreshError) {
          console.error(
            "Failed to refresh token and retry request:",
            refreshError,
          );
          throw new Error("Failed to refresh Worksmart token and fetch user");
        }
      }
      console.error("Error fetching user from Worksmart API:", error);
      throw error;
    }
  }

  async createUser(
    email: string,
    provider: string,
    providerID: string,
  ): Promise<any> {
    const res = await axios.post(
      `${env.WORKSMART_API_URL}/v1/store/user`,
      {
        Email: email,
        provider: provider,
        provider_id: providerID,
      },
      {
        headers: this.getHeaders(),
      },
    );

    return res.data.data;
  }

  async signin(email: string, password: string): Promise<any> {
    try {
      const res = await axios.post(
        `${env.WORKSMART_API_URL}/v1/auth/sign_in`,
        {
          Email: email,
          Password: password,
        },
        {
          headers: {
            "content-type": "application/json",
            "x-dostow-group-access-key": env.WORKSMART_API_KEY,
          },
        },
      );

      const { Email, id, name } = res.data.data;
      return { email: Email, id, name };
    } catch (err) {
      return null;
    }
  }

  async deleteApiKey(
    id: string,
    user_id: string,
  ): Promise<{ access_key: string; created_at: string; id: string }[]> {
    const keyName = `ugk_${user_id}`;
    const existing = await axios.get(
      `${env.WORKSMART_API_URL}/v1/group_key/${id}`,
      {
        headers: this.getHeaders(),
      },
    );
    if (!existing.data.name.includes(keyName)) {
      throw new Error("invalid key");
    }
    const res = await axios.delete(
      `${env.WORKSMART_API_URL}/v1/group_key/${id}`,
      {
        headers: this.getHeaders(),
      },
    );

    return res.data.data;
  }

  async getApiKey(
    user_id: string,
  ): Promise<{ access_key: string; created_at: string; id: string }[]> {
    const query = { q: `{"name": "^ugk_${user_id}.*"}` };
    const res = await axios.get(
      `${env.WORKSMART_API_URL}/v1/group_key?${new URLSearchParams(query)}`,
      {
        headers: this.getHeaders(),
      },
    );

    return res.data.data;
  }

  async createApiKey(user_id: string): Promise<any> {
    const res = await axios.post(
      `${env.WORKSMART_API_URL}/v1/group_key`,
      {
        name: `ugk_${user_id}`,
        acl: [
          {
            action: "write",
            store: "message",
          },
          {
            action: "read",
            store: "log",
          },
        ],
      },
      {
        headers: this.getHeaders(),
      },
    );

    return res.data;
  }

  async upsertApiKey(user_id: string): Promise<any> {
    try {
      const res = await this.getApiKey(user_id);

      return res;
    } catch (err) {
      const res = await this.createApiKey(user_id);
      return res;
    }
  }

  async createPushSession({
    group,
    key,
  }: {
    group: string;
    key: string;
  }): Promise<any> {
    const res = await axios.post(
      `${env.WORKSMART_API_URL}/v1/store/push_session`,
      {
        group,
        key,
      },
      {
        headers: this.getHeaders(),
      },
    );

    return res.data;
  }
  async createPushPrivateChannel(id: string, request: any): Promise<any> {
    const res = await axios.put(
      `${env.WORKSMART_API_URL}/v1/store/push_session/${id}`,
      request,
      {
        headers: this.getHeaders(),
      },
    );

    return res.data;
  }
  async getInstance(id: string): Promise<Instance> {
    const res = await axios.get(
      `${env.WORKSMART_API_URL}/v1/store/instance/${id}`,
      {
        headers: this.getHeaders(),
      },
    );

    return res.data;
  }

  async logoutInstance(id: string): Promise<any> {
    const instance = await worksmart.getInstance(id);
    // return res.status(200).json({ key });
    const url = `https://${instance.subdomain}.${instance.domain}/app/logout`;
    const response = await axios.get(url, {
      auth: {
        username: instance.id,
        password: instance.password,
      },
    });
    if (response.status === 200) {
      return response.data;
    }
  }
  async createInstanceQR(id: string): Promise<any> {
    const instance = await worksmart.getInstance(id);
    // return res.status(200).json({ key });
    const url = `https://${instance.subdomain}.${instance.domain}/app/login`;
    const response = await axios.get(url, {
      auth: {
        username: instance.id,
        password: instance.password,
      },
    });
    if (response.status === 200) {
      return response.data;
    }
  }

  async createToken(token: VerificationToken): Promise<VerificationToken> {
    const res = await axios.post(
      `${env.WORKSMART_API_URL}/v1/store/tokens`,
      token,
      {
        headers: this.getHeaders(),
      },
    );

    if (res.status === 200 && res.data) {
      return res.data;
    }
    throw new Error("Failed to create token");
  }

  async fetchToken({
    identifier,
    token,
  }: {
    identifier: string;
    token: string;
  }): Promise<VerificationToken> {
    const res = await axios.get(
      `${env.WORKSMART_API_URL}/v1/store/tokens?q=${JSON.stringify({
        token,
        identifier,
      })}`,
      {
        headers: this.getHeaders(),
      },
    );

    if (
      res.status === 200 &&
      res.data &&
      res.data.data &&
      res.data.data.length > 0
    ) {
      const firstToken = res.data.data[0];
      return firstToken;
    }
    throw new Error("Token not found");
  }

  async getInstanceDevices(id: string): Promise<any> {
    const instance = await worksmart.getInstance(id);
    // return res.status(200).json({ key });
    const url = `https://${instance.subdomain}.${instance.domain}/app/devices`;
    const response = await axios.get(url, {
      auth: {
        username: instance.id,
        password: instance.password,
      },
    });
    if (response.status === 200) {
      return response.data;
    }
    throw new Error("failed");
  }
  async sendWhatsappMessage(
    phone: string,
    text: string,
    key: string,
  ): Promise<any> {
    const url = `https://api.vazapay.com/v1/wuuf/message`;
    const response = await axios.post(
      url,
      {
        text,
        to: {
          whatsapp: phone,
        },
      },
      {
        headers: {
          "content-type": "application/json",
          "z-api-key": key,
        },
      },
    );
    if (response.status === 200) {
      return response.data;
    }
    throw new Error("send failed");
  }

  async createInstance(
    user_id: string,
    name: string,
    instance_type: string,
  ): Promise<Instance> {
    const res = await axios.post(
      `${env.WORKSMART_API_URL}/v1/store/instance`,
      {
        user_id,
        name,
        instance_type,
      },
      {
        headers: this.getHeaders(),
      },
    );

    return res.data;
  }

  async startInstance(id: string): Promise<Instance> {
    const res = await axios.put(
      `${env.WORKSMART_API_URL}/v1/store/instance/${id}`,
      {
        status: "creating",
        error: "",
      },
      {
        headers: this.getHeaders(),
      },
    );

    return res.data;
  }

  async discardInstance(id: string): Promise<Instance> {
    const res = await axios.put(
      `${env.WORKSMART_API_URL}/v1/store/instance/${id}`,
      {
        status: "discarding",
        error: "",
      },
      {
        headers: this.getHeaders(),
      },
    );

    return res.data;
  }

  async getInstances(user_id: string): Promise<Instance[]> {
    const query = { q: `{"user_id": "${user_id}"}` };
    const res = await axios.get(
      `${env.WORKSMART_API_URL}/v1/store/instance?${new URLSearchParams(
        query,
      )}`,
      {
        headers: this.getHeaders(),
      },
    );

    return res.data.data;
  }

  async updateInstancePhone(
    id: string,
    phone: string,
    name: string,
  ): Promise<any> {
    const res = await axios.put(
      `${env.WORKSMART_API_URL}/v1/store/instance/${id}`,
      {
        phone: phone,
        phone_name: name,
      },
      {
        headers: this.getHeaders(),
      },
    );

    return res.data;
  }

  async getChannels(user_id: string): Promise<any> {
    const query = { q: `{"user_id": "${user_id}"}` };
    const res = await axios.get(
      `${env.WORKSMART_API_URL}/v1/store/channel?${new URLSearchParams(query)}`,
      {
        headers: this.getHeaders(),
      },
    );

    return res.data.data;
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await axios.post<{ access_token: string }>(
        `${env.WORKSMART_API_URL}/v1/auth/refresh`,
        {
          refresh_token: env.WORKSMART_REFRESH_TOKEN,
        },
        {
          headers: this.getHeaders(),
        },
      );

      if (!response.data?.access_token) {
        throw new Error("No access token in refresh response");
      }
      return response.data.access_token;
    } catch (error: unknown) {
      console.error("Failed to refresh Worksmart token:", error);
      throw new Error("Failed to refresh Worksmart token");
    }
  }
}

const worksmart = new Worksmart();
export type WorksmartType = typeof worksmart;

export default worksmart;
