import axios, { AxiosError } from "axios";
import { Instance } from "../types";
import { env } from "@/env.mjs";
import { VerificationToken } from "next-auth/adapters";

export class Worksmart {
  constructor() { }

  async getLogs(
    user_id: string,
    {
      skip,
      pageSize,
    }: {
      skip: number;
      pageSize: number;
    }
  ): Promise<any> {
    const query = {
      skip: `${skip}`,
      size: `${pageSize}`,
      q: `{"user_id": "${user_id}"}`,
    };
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
  }
  async getUser(email: string): Promise<any> {
    const query = { q: `{"Email":"${email}"}` };
    const res = await axios.get(
      `${env.WORKSMART_API_URL}/v1/store/user?${new URLSearchParams(query)}`,
      {
        headers: {
          "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
          Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
        },
      }
    );
    if (res.data.data.length > 0) {
      return res.data.data[0];
    }
    return null;
  }

  async createUser(
    email: string,
    provider: string,
    providerID: string
  ): Promise<any> {
    const res = await axios.post(
      `${env.WORKSMART_API_URL}/v1/store/user`,
      {
        Email: email,
        provider: provider,
        provider_id: providerID,
      },
      {
        headers: {
          "x-dostow-group": env.WORKSMART_GROUP,
          Authorization: `${env.WORKSMART_AUTH_TOKEN}`,
        },
      }
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
        }
      );

      const { Email, id, name } = res.data.data;
      return { email: Email, id, name };
    } catch (err) {
      return null;
    }
  }

  async deleteApiKey(
    id: string,
    user_id: string
  ): Promise<{ access_key: string; created_at: string; id: string }[]> {
    const keyName = `ugk_${user_id}`;
    const existing = await axios.get(
      `${env.WORKSMART_API_URL}/v1/group_key/${id}`
    );
    if (!existing.data.name.includes(keyName)) {
      throw new Error("invalid key");
    }
    const res = await axios.delete(
      `${env.WORKSMART_API_URL}/v1/group_key/${id}`,
      {
        headers: {
          "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
          Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
        },
      }
    );

    return res.data.data;
  }

  async getApiKey(
    user_id: string
  ): Promise<{ access_key: string; created_at: string; id: string }[]> {
    const query = { q: `{"name": "^ugk_${user_id}.*"}` };
    const res = await axios.get(
      `${env.WORKSMART_API_URL}/v1/group_key?${new URLSearchParams(query)}`,
      {
        headers: {
          "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
          Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
        },
      }
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
        headers: {
          "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
          Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
        },
      }
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
        headers: {
          "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
          Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
        },
      }
    );

    return res.data;
  }
  async createPushPrivateChannel(id: string, request: any): Promise<any> {
    const res = await axios.put(
      `${env.WORKSMART_API_URL}/v1/store/push_session/${id}`,
      request,
      {
        headers: {
          "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
          Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
        },
      }
    );

    return res.data;
  }
  async getInstance(id: string): Promise<Instance> {
    const res = await axios.get(
      `${env.WORKSMART_API_URL}/v1/store/instance/${id}`,
      {
        headers: {
          "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
          Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
        },
      }
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
        headers: {
          "X-DOSTOW-GROUP-ACCESS-KEY": env.WORKSMART_API_KEY,
        },
      }
    );

    if (res.status === 200 && res.data) {
      return res.data;
    }
    throw new Error("Failed to create token");
  }

  async fetchToken({ identifier, token }: { identifier: string, token: string }): Promise<VerificationToken> {
    const res = await axios.get(
      `${env.WORKSMART_API_URL}/v1/store/tokens?q=${JSON.stringify({ token, identifier })}`,
      {
        headers: {
          "X-DOSTOW-GROUP-ACCESS-KEY": env.WORKSMART_API_KEY,
        },
      }
    )

    if (res.status === 200 && res.data && res.data.data && res.data.data.length > 0) {
      const firstToken = res.data.data[0]
      return firstToken
    }
    throw new Error("Token not found")
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
    key: string
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
      }
    );
    if (response.status === 200) {
      return response.data;
    }
    throw new Error("send failed");
  }

  async createInstance(
    user_id: string,
    name: string,
    instance_type: string
  ): Promise<Instance> {
    const res = await axios.post(
      `${env.WORKSMART_API_URL}/v1/store/instance`,
      {
        user_id,
        name,
        instance_type,
      },
      {
        headers: {
          "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
          Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
        },
      }
    );

    return res.data;
  }

  // TODO: password and location of wuufman instance should not be exposed to this service. instead use a store with a pull request to execute actions
  async startInstance(id: string): Promise<Instance> {
    const res = await axios.put(
      `${env.WORKSMART_API_URL}/v1/store/instance/${id}`,
      {
        status: "creating",
        error: "",
      },
      {
        headers: {
          "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
          Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
        },
      }
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
        headers: {
          "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
          Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
        },
      }
    );

    return res.data;
  }

  async getInstances(user_id: string): Promise<Instance[]> {
    const query = { q: `{"user_id": "${user_id}"}` };
    const res = await axios.get(
      `${env.WORKSMART_API_URL}/v1/store/instance?${new URLSearchParams(
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
  }

  async updateInstancePhone(
    id: string,
    phone: string,
    name: string
  ): Promise<any> {
    const res = await axios.put(
      `${env.WORKSMART_API_URL}/v1/store/instance/${id}`,
      {
        phone: phone,
        phone_name: name,
      },
      {
        headers: {
          "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
          Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
        },
      }
    );

    return res.data;
  }

  async getChannels(user_id: string): Promise<any> {
    const query = { q: `{"user_id": "${user_id}"}` };
    const res = await axios.get(
      `${env.WORKSMART_API_URL}/v1/store/channel?${new URLSearchParams(query)}`,
      {
        headers: {
          "X-DOSTOW-GROUP": env.WORKSMART_GROUP,
          Authorization: `Bearer ${env.WORKSMART_AUTH_TOKEN}`,
        },
      }
    );

    return res.data.data;
  }
}

const worksmart = new Worksmart();
export type WorksmartType = typeof worksmart;

export default worksmart;
