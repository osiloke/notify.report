interface PlanLinks {
  monthly: string;
  yearly: string;
}

interface SubscriptionPlan {
  free: PlanLinks;
  pro: PlanLinks;
}

export interface SubscriptionPlans {
  development: SubscriptionPlan;
  test: SubscriptionPlan;
  production: SubscriptionPlan;
}

export const subscriptionPlans = {
  development: {
    free: {
      monthly: "https://api.vazapay.com/v1/onepay/sub/test_9AQ7use7tcS5bhm289",
      yearly: "https://api.vazapay.com/v1/onepay/sub/test_fZe5mk9Rdg4h3OUaEH",
    },
    pro: {
      monthly: "https://api.vazapay.com/v1/onepay/sub/test_9AQ7use7tcS5bhm289",
      yearly: "https://api.vazapay.com/v1/onepay/sub/test_fZe5mk9Rdg4h3OUaEH",
    },
    // team: {
    //   monthly: "https://api.vazapay.com/v1/onepay/sub/test_9AQ4igbZl3hvdpu002",
    //   yearly: "https://api.vazapay.com/v1/onepay/sub/test_00gdSQ0gD9FT1GMeV0",
    // },
  },
  test: {
    free: {
      monthly: "https://api.vazapay.com/v1/onepay/sub/test_9AQ7use7tcS5bhm289",
      yearly: "https://api.vazapay.com/v1/onepay/sub/test_fZe5mk9Rdg4h3OUaEH",
    },
    pro: {
      monthly: "https://api.vazapay.com/v1/onepay/sub/test_9AQ7use7tcS5bhm289",
      yearly: "https://api.vazapay.com/v1/onepay/sub/test_fZe5mk9Rdg4h3OUaEH",
    },
    // team: {
    //   monthly: "https://api.vazapay.com/v1/onepay/sub/test_9AQ4igbZl3hvdpu002",
    //   yearly: "https://api.vazapay.com/v1/onepay/sub/test_00gdSQ0gD9FT1GMeV0",
    // },
  },
  production: {
    free: {
      monthly: "https://api.vazapay.com/v1/onepay/sub/fZe4hL0fWb7KdEI289",
      yearly: "https://api.vazapay.com/v1/onepay/sub/28o4hL0fW0t6dEI7su",
    },
    pro: {
      monthly: "https://api.vazapay.com/v1/onepay/sub/fZe4hL0fWb7KdEI289",
      yearly: "https://api.vazapay.com/v1/onepay/sub/28o4hL0fW0t6dEI7su",
    },
    // team: {
    //   monthly: "https://api.vazapay.com/v1/onepay/sub/fZeg0t2o41xa6cg6ot",
    //   yearly: "https://api.vazapay.com/v1/onepay/sub/28o6pT1k03FifMQbIO",
    // },
  },
};
