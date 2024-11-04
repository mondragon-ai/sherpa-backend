import {rechargeAPIRequests} from ".";
import {addThirtyDays} from "../../util/formatters/time";
import {MerchantDocument} from "../../lib/types/merchant";
import {CustomerSubscriptionList} from "../../lib/types/recharge/subscriptions";

export const getRechargeSubscription = async (
  merchant: MerchantDocument,
  recharge_id: number,
) => {
  const recharge = merchant.apps.find((a) => a.name == "recharge");
  if (!recharge || !recharge.token) return null;

  const {data: subscription} = await rechargeAPIRequests(
    `/subscriptions?customer_id=${recharge_id}`,
    "GET",
    null,
    recharge.token,
  );

  const recharge_sub = subscription as CustomerSubscriptionList;
  const sub = recharge_sub.subscriptions[0];

  const date = sub.next_charge_scheduled_at || "";
  const sub_id = sub.id || 0;

  return {sub_id, date};
};

export const freezeRechargeSubscription = async (
  merchant: MerchantDocument,
  subscription_id: number,
  date: string,
): Promise<boolean> => {
  const updated_date = addThirtyDays(date);
  const payload = {date: updated_date.split("T")[0]};

  const recharge = merchant.apps.find((a) => a.name == "recharge");
  if (!recharge || !recharge.token) return false;

  const {status} = await rechargeAPIRequests(
    `/subscriptions/${subscription_id}/set_next_charge_date`,
    "POST",
    payload,
    recharge.token,
  );

  if (status > 300) {
    return false;
  }

  return true;
};

export const cancelRechargeSubscription = async (
  merchant: MerchantDocument,
  subscription_id: number,
) => {
  const recharge = merchant.apps.find((a) => a.name == "recharge");
  if (!recharge || !recharge.token) return false;

  const {status} = await rechargeAPIRequests(
    `/subscriptions/${subscription_id}/cancel`,
    "POST",
    {cancellation_reason: "Sherpa App Canceled"},
    recharge.token,
  );

  if (status > 300) {
    return false;
  }

  return true;
};
