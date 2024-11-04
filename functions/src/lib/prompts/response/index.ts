import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {ConfigurationsType, MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildCustomerPrompt = (chat: ChatDocument | EmailDocument) => {
  if (!chat || !chat.customer) {
    return `
          ## Customer Data
          - Customer Not Found
      `;
  }

  /* eslint-disable indent */
  const {first_name, last_name, email, total_spent, total_orders, address} =
    chat.customer;

  return `
      ## Customer Data:
      - **Name**: ${first_name || "Customer"} ${last_name || ""}
      - **Email**: ${email}
      - **Total Spent**: $${Number(total_spent).toFixed(2)}
      - **Total Orders**: ${total_orders}
      - **Shipping Address**: ${address}
  `;
  /* eslint-enable indent */
};

export const buildOrderPrompt = (
  chat: ChatDocument | EmailDocument,
  is_action = false,
) => {
  if (!chat || !chat.order) {
    return `
        ## Order Data:
        - Order Not Found
    `;
  }

  const {
    order_number,
    fulfillment_status,
    payment_status,
    created_at,
    current_total_price,
    line_items,
    tracking_url,
  } = chat.order;

  /* eslint-disable indent */
  return `
      ## Order Information
      - **Order Number**: ${order_number}
      - **Order Status**: ${fulfillment_status}
      - **Payment Status**: ${payment_status}
      - **Order Date**: ${new Date(created_at * 1000).toLocaleDateString()}
      - **Total Price**: $${current_total_price}
      - **Tracking URL**: $${tracking_url}
      - **Items**:
      ${
        line_items
          .map((item) => {
            const ids = is_action
              ? `[var id: (${item.variant_id})  prod id: (${item.product_id})]`
              : null;

            return `  -- ${item.quantity} x ${item.title} (${item.options}) ${ids}`;
          })
          .join("\n") || "N/A"
      }
  `;
  /* eslint-enable indent */
};

const setTone = (configurations: ConfigurationsType) => {
  switch (configurations.tone) {
    case "playful":
      return "Fun, playful, with limited sarcasm.";
    case "standard":
      return "Informal, professional, respectful, and clear";
    case "custom":
      return configurations.custom_tone;
    default:
      return "Informal, professional, respectful, and clear";
  }
};

export const basePrompt = (
  merchant: MerchantDocument,
  chat: ChatDocument | EmailDocument,
  classification: ClassificationTypes,
) => {
  /* eslint-disable indent */
  const {configurations} = merchant;
  const today = new Date().toDateString();
  const tone = setTone(configurations);
  const links =
    merchant.configurations.links
      .map((link) => `- [${link.name}](${link.url})`)
      .join("\n") || "N/A";

  const discount = configurations.price_rules.value;
  const return_days = merchant.configurations.return
    ? `${merchant.configurations.return} days`
    : "No returns allowed";

  const exchanges = merchant.configurations.exchanges
    ? "Allowed"
    : "Not allowed";

  const refund = merchant.configurations.refund ? "Enabled" : "Disabled";

  const specific = chat.specific_issue;

  const payload = `
    ### Context: 
      This is a **customer service chatbot** for a Shopify store. The chatbot assists with customer inquiries, categorized into **order status, refunds, cancellations, shipping, exchanges, subscriptions**, and other common support topics.

    ## Chatbot Guidelines:
      - Use **Markdown** format for responses with structured items, lists, and bold emphasis on key information.
      - Respond in a ${tone} tone, tailored to the customer.

    ## Instructions:
      - **DO NOT GENERATE LINKS** unless provided by merchant configuration.
      - Before processing a refund or cancellation, offer a **${discount} discount** on the next order (only offer if the current order is over $50).
      - **Only perform one action** (either process a cancellation or offer a discount) based on the customer's preference and the issue type.
      - If asked, deny being a bot. Say you live in arknasas and use psuedo name for safety but you are married with 2 kids.
      - **Avoid repetition**; provide concise responses.
      - **Use direct chat format** (no email/letter style).
      - Supervisor approval may be required for certain actions.
      - Confirmed actions will be emailed to the customer after the chat closes.

    ## Merchant Info:
      - **Store**: ${configurations.store}
      - **Contact Email**: ${merchant.configurations.contact_email}
      - **Timezone**: ${merchant.timezone}

    ### Store Policies:
      - **Return Policy**: ${return_days}
      - **Exchanges**: ${exchanges}
      - **Refund Policy**: ${refund}
      - **Damaged Items Handling**: ${configurations.damged_items}
      - **Store Contact Email**: ${configurations.contact_email}
      - Unfulfilled orders due to high demand.

    ## Chat Context:
      - **Customer Issue Type**: ${chat.issue}
      - **Specific Issue** (if any): ${chat.specific_issue || " - "}
      - **GPT Classified Ticket** (if any): ${chat.classification || " - "}

    ## Issue Details:
      The customer has reported an issue categorized as **${classification}**, with a specific concern: "${specific}". Address the issue using the relevant FAQ, configuration data, and **${classification}-related actions** (e.g., refunds, cancellations, order updates) if permitted by merchant policy.

    ### Response Guidelines
      1. **Refunds**: If a **refund** is requested and permitted, outline refund options based on merchant policy. Confirm with the customer before proceeding.
      2. **Cancellations**: If **order cancellation** is allowed, proceed with cancellation steps and confirm with the customer.
      3. **Subscriptions**: Handle subscription issues according to the merchant's subscription FAQ. Guide the customer through changes or cancellations if allowed.
      4. **General Queries**: For questions on products, discounts, or giveaways, refer to relevant FAQ sections or configuration settings.
      5. **Exchanges**: If an **exchange** is requested and allowed by policy, provide options to the customer and confirm before processing.
      6. **Address Change**: If a customer requests an **address change** on an order, check if the order is still pending fulfillment. If possible, update the shipping address and confirm with the customer.
      7. **Discount**: If a discount is applicable, offer the **${discount} discount** for future purchases over $50. Confirm with the customer that they understand the discount terms.

    ## Additional Information:
      Use provided links if relevant: ${links}

    ### Dates
      - **Today's Date**: ${today}

    Respond promptly, confirm any actions taken, and generate your response in Markdown format before submitting. Since you cannot "look things up," just respond promptly.

  `;
  /* eslint-enable indent */
  return payload;
};
