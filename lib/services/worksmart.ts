import axios, { AxiosError } from "axios";
import { Instance } from "../types";
import { env } from "@/env.mjs";

export class Worksmart {
  constructor() {}

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
  async getUser(email: string): Promise<any> {
    const query = { q: `{"Email":"${email}"}` };
    try {
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
    } catch (err) {
      throw err; // Re-throw the error to reject the Promise
    }
  }

  async createUser(
    email: string,
    provider: string,
    providerID: string
  ): Promise<any> {
    try {
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
    } catch (err) {
      console.log((err as AxiosError).response?.data);
      throw err; // Re-throw the error to reject the Promise
    }
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

      return res.data.data;
    } catch (err) {
      return null;
    }
  }

  async getApiKey(
    user_id: string
  ): Promise<{ access_key: string; created_at: string; id: string }[]> {
    const query = { q: `{"name": "^ugk_${user_id}.*"}` };
    try {
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
    } catch (err) {
      throw err; // Re-throw the error to reject the Promise
    }
  }

  async createApiKey(user_id: string): Promise<any> {
    try {
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
    } catch (err) {
      throw err; // Re-throw the error to reject the Promise
    }
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
    try {
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
    } catch (err) {
      throw err; // Re-throw the error to reject the Promise
    }
  }
  async createPushPrivateChannel(id: string, request: any): Promise<any> {
    try {
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
    } catch (err) {
      throw err; // Re-throw the error to reject the Promise
    }
  }
  async getInstance(id: string): Promise<Instance> {
    try {
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
    } catch (err) {
      throw err; // Re-throw the error to reject the Promise
    }
  }

  async createInstanceQR(id: string): Promise<any> {
    try {
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
    } catch (error) {
      const e = error as AxiosError;
      throw e;
    }
  }

  async getInstanceDevices(id: string): Promise<any> {
    try {
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
    } catch (error) {
      throw error;
    }
  }
  async sendWhatsappMessage(
    phone: string,
    text: string,
    key: string
  ): Promise<any> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  async createInstance(
    user_id: string,
    name: string,
    instance_type: string
  ): Promise<Instance> {
    try {
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
    } catch (err) {
      console.error(JSON.stringify((err as AxiosError).response));
      throw err; // Re-throw the error to reject the Promise
    }
  }

  // TODO: password and location of wuufman instance should not be exposed to this service. instead use a store with a pull request to execute actions
  async startInstance(id: string): Promise<Instance> {
    try {
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
    } catch (err) {
      throw err; // Re-throw the error to reject the Promise
    }
  }

  async discardInstance(id: string): Promise<Instance> {
    try {
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
    } catch (err) {
      throw err; // Re-throw the error to reject the Promise
    }
  }

  async getInstances(user_id: string): Promise<Instance[]> {
    const query = { q: `{"user_id": "${user_id}"}` };
    try {
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
    } catch (err) {
      throw err; // Re-throw the error to reject the Promise
    }
  }

  async updateInstancePhone(
    id: string,
    phone: string,
    name: string
  ): Promise<any> {
    try {
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
    } catch (err) {
      throw err; // Re-throw the error to reject the Promise
    }
  }

  async getChannels(user_id: string): Promise<any> {
    const query = { q: `{"user_id": "${user_id}"}` };
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
}

const worksmart = new Worksmart();

export default worksmart;
