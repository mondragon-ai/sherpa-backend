import {rechargeAPIRequests} from ".";
import {ChatDocument} from "../../lib/types/chats";
import {EmailDocument} from "../../lib/types/emails";
import {MerchantDocument} from "../../lib/types/merchant";

export const findRechargeCustomer = async (
  merchant: MerchantDocument,
  chat: ChatDocument | EmailDocument,
) => {
  if (!chat.customer || !chat.customer.email) {
    return null;
  }

  const recharge = merchant.apps.find((a) => a.name == "recharge");
  if (!recharge || !recharge.token) return null;

  const {data} = await rechargeAPIRequests(
    `/customers?email=${chat.customer.email}`,
    "GET",
    null,
    recharge.token,
  );

  return data;
};
