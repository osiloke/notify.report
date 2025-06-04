// import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { NextApiHandler } from "next";

import { stripe } from "@/lib/stripe/stripe";
import { auth } from "@/lib/auth";
import { getURL } from "@/lib/utils";
import worksmart from "@/lib/services/worksmart";

// Mock users array for demonstration purposes
const mockUsers: Array<{
  id: string;
  stripe_customer_id?: string;
  email?: string;
}> = [];

export const createOrRetrieveCustomer = async ({
  email,
  uuid,
}: {
  email?: string;
  uuid: string;
}) => {
  console.log("Fetching user", uuid);
  // const user = await prisma.user.findUnique({
  //   where: {
  //     id: uuid,
  //   },
  // });

  const user = await worksmart.getUser(email!);

  console.log("User: ", user);

  if (!user || !user.stripe_customer_id) {
    const customerData: { metadata: { id: string }; email?: string } = {
      // ...(email ? { email } : { email: user?.email! }),
      // ...(email ? { email } : null),
      // email: ,
      email,
      metadata: {
        id: uuid,
      },
    };

    const customer = await stripe.customers.create(customerData);

    // Replace prisma.user.update with mock data operation
    const userIndex = mockUsers.findIndex((u) => u.id === uuid);
    if (userIndex !== -1) {
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        stripe_customer_id: customer.id,
      };
    }
    return customer.id;
  }
  return user.stripe_customer_id;
};

const CreateCheckoutSession: NextApiHandler = async (req, res) => {
  if (req.method === "POST") {
    const { priceId, quantity = 1, metadata = {} } = req.body;

    try {
      const session = await auth();

      if (!session) {
        return res.status(401).json({ message: "You must be logged in." });
      }

      const customer = await createOrRetrieveCustomer({
        uuid: session.user?.id || "",
        email: session.user?.email || "",
      });

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        billing_address_collection: "required",
        customer,
        line_items: [
          {
            price: priceId,
            quantity,
          },
        ],
        mode: "subscription",
        allow_promotion_codes: true,
        subscription_data: {
          trial_from_plan: true,
          metadata,
        },
        success_url: `${getURL()}/`,
        cancel_url: `${getURL()}/`,
      });

      return res.status(200).json({ sessionId: stripeSession.id });
    } catch (err: any) {
      console.log(err);
      res
        .status(500)
        .json({ error: { statusCode: 500, message: err.message } });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default CreateCheckoutSession;
