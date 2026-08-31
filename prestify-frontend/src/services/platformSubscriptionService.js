import api from './api'

const list = async ({
  search = '',
  plan = '',
  billingCycle = '',
  subscriptionStatus = '',
  active = '',
  page = 0,
  size = 10,
} = {}) => {
  const params = {
    search,
    page,
    size,
  }

  if (plan) {
    params.plan = plan
  }

  if (billingCycle) {
    params.billingCycle =
      billingCycle
  }

  if (subscriptionStatus) {
    params.subscriptionStatus =
      subscriptionStatus
  }

  if (
    active !== '' &&
    active !== null &&
    active !== undefined
  ) {
    params.active = active
  }

  const response =
    await api.get(
      '/api/platform/subscriptions',
      {
        params,
      }
    )

  return response.data
}

const platformSubscriptionService = {
  list,
}

export default platformSubscriptionService