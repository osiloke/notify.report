import { stripe } from "@/lib/stripe/stripe";
import Stripe from "stripe";

// Mock data stores
const mockUsers: any[] = [];
const mockSubscriptions: any[] = [];
const mockPayments: any[] = [];

export const toDateTime = (secs: number) => {
  var t = new Date("1970-01-01T00:30:00Z"); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
export const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod,
) => {
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  await stripe.customers.update(customer, {
    name,
    phone,
    address: {
      city: address.city ?? undefined,
      country: address.country ?? undefined,
      line1: address.line1 ?? undefined,
      line2: address.line2 ?? undefined,
      postal_code: address.postal_code ?? undefined,
      state: address.state ?? undefined,
    },
  });

  // Replace prisma.user.update with mock data operation
  const userIndex = mockUsers.findIndex((u) => u.id === uuid);
  if (userIndex !== -1) {
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      billing_address: { ...address },
      payment_method: JSON.stringify(payment_method[payment_method.type]),
    };
  }
};

export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false,
) => {
  // Replace prisma.user.findUnique with mock data operation
  const user = mockUsers.find((u) => u.stripe_customer_id === customerId);

  console.log(
    `User [${user?.id}] is changing subscription [${subscriptionId}] wth customer [${customerId}]`,
  );

  if (!user) {
    throw new Error("User not found.");
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"],
  });

  // Upsert the latest status of the subscription object.
  const subscriptionData = {
    id: subscription.id,
    userId: user.id,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? toDateTime(subscription.cancel_at).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(
      subscription.current_period_start,
    ).toISOString(),
    current_period_end: toDateTime(
      subscription.current_period_end,
    ).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at
      ? toDateTime(subscription.ended_at).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? toDateTime(subscription.trial_end).toISOString()
      : null,
  };

  // Replace prisma.subscription.upsert with mock data operation
  const existingSubscriptionIndex = mockSubscriptions.findIndex(
    (sub) => sub.id === subscriptionData.id,
  );
  let result;
  if (existingSubscriptionIndex !== -1) {
    mockSubscriptions[existingSubscriptionIndex] = subscriptionData;
    result = mockSubscriptions[existingSubscriptionIndex];
  } else {
    mockSubscriptions.push(subscriptionData);
    result = subscriptionData;
  }

  console.log(
    `Inserted/updated subscription [${result.id}] for user [${result.userId}]`,
  );

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method && user.id)
    //@ts-ignore
    await copyBillingDetailsToCustomer(
      user.id,
      subscription.default_payment_method as Stripe.PaymentMethod,
    );
};

export const upsertPaymentIntentRecord = async (
  paymentIntentId: string,
  customerId: string,
) => {
  // Replace prisma.user.findUnique with mock data operation
  const user = mockUsers.find((u) => u.stripe_customer_id === customerId);

  if (!user) {
    throw new Error("User not found.");
  }

  // Get payment intent from Stripe.
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (!paymentIntent) {
    throw new Error(`Payment intent not found: ${paymentIntentId}`);
  }

  const payment = {
    id: paymentIntentId,
    userId: user.id,
    currency: paymentIntent.currency,
    amount: paymentIntent.amount,
    status: paymentIntent.status,
    metadata: paymentIntent.metadata,
    created: toDateTime(paymentIntent.created).toISOString(),
    canceled_at: paymentIntent.canceled_at
      ? toDateTime(paymentIntent.canceled_at).toISOString()
      : null,
  };

  // Replace prisma.payment.upsert with mock data operation
  const existingPaymentIndex = mockPayments.findIndex(
    (p) => p.id === paymentIntentId,
  );
  let paymentIntentRecord;
  if (existingPaymentIndex !== -1) {
    mockPayments[existingPaymentIndex] = payment;
    paymentIntentRecord = mockPayments[existingPaymentIndex];
  } else {
    mockPayments.push(payment);
    paymentIntentRecord = payment;
  }

  console.log(
    `Inserted/updated payment intent [${paymentIntentRecord.id}] for user [${paymentIntentRecord.userId}]`,
  );
};
