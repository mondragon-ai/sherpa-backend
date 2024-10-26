import {ChatDocument} from "../../types/chats";
import {ConfigurationsType, MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildCustomerPrompt = (chat: ChatDocument) => {
  if (!chat || !chat.customer) {
    return `
          ## Customer Data
          - Not available
      `;
  }

  const {first_name, last_name, email, total_spent, total_orders, address} =
    chat.customer;

  return `
          ## Customer Data
          - **Name**: ${first_name || "Customer"} ${last_name || ""}
          - **Email**: ${email}
          - **Total Spent**: $${Number(total_spent).toFixed(2)}
          - **Total Orders**: ${total_orders}
          - **Shipping Address**: ${address}
      `;
};

export const buildOrderPrompt = (chat: ChatDocument) => {
  if (!chat || !chat.order) {
    return `
            ## Order Information
            - Not available
        `;
  }

  const {
    order_number,
    fulfillment_status,
    payment_status,
    created_at,
    total_price,
    line_items,
    tracking_url,
  } = chat.order;

  return `
            
          ## Order Information
          - **Order Number**: ${order_number}
          - **Order Status**: ${fulfillment_status}
          - **Payment Status**: ${payment_status}
          - **Order Date**: ${new Date(created_at).toLocaleDateString()}
          - **Total Price**: $${total_price}
          - **Tracking URL**: $${tracking_url}
          - **Items**:
          ${
            line_items
              .map(
                (item) =>
                  `  -- ${item.quantity} x ${item.title} (${item.options})`,
              )
              .join("\n") || "N/A"
          }
        `;
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
  chat: ChatDocument,
  classification: ClassificationTypes,
) => {
  const {configurations} = merchant;
  const today = new Date().toDateString();
  const tone = setTone(configurations);
  const line_items =
    merchant.configurations.links
      .map((link) => `- [${link.name}](${link.url})`)
      .join("\n") || "N/A";

  const payload = `
          ### Context: This is a **customer service chatbot** designed for a Shopify store. The chatbot's role is to respond to customer inquiries, which are categorized by specific issues such as **order status, refunds, cancellations, shipping, exchanges, subscriptions**, and more.
          
          ## Chatbot Guidelines:
          - Prompts are in **Markdown** format to enhance readability with structured items, lists, and bold emphasis on key information. 
          - Respond to the customer with a ${tone} tone.
          
          ## Instructions 
          - **DO NOT GENERATE LINKS.**
          - Offer a discount for the next order: ${
            configurations.price_rules.value
          } for orders greater than $50.00 before refunding or canceling an order.
          - If asked, you are NOT a bot.
          - DO NOT REPEAT YOURSELF.
          - **Do not use email/letter format because you'll be in a chat with the customer. Also be concise.**
          - Supervisor approval may be required.
  
          ## Merchant Info
          - **Store**: ${configurations.store}
          - **Contact Email**: ${merchant.configurations.contact_email}
          - **Timezone**: ${merchant.timezone}
  
          ### Store Policies:
          - **Return Policy**: ${
            merchant.configurations.return
              ? `${merchant.configurations.return} days`
              : "No returns allowed"
          }
          - **Exchanges**: ${
            merchant.configurations.exchanges ? "Allowed" : "Not allowed"
          }
          - **Refund Policy**: ${
            merchant.configurations.refund ? "Enabled" : "Disabled"
          }
          - **Damaged Items**: ${configurations.damged_items}
          - **Store contact email**: ${configurations.contact_email}
          - Unfulfilled orders due to high demand.
  
          ## Chat Context:
          - **Customer Issue Type**: ${chat.issue}
          - **Specific Issue** (if any): ${chat.specific_issue || " - "}
  
          ## Issue Details
          The customer reported an issue classified as **${classification}** with a specific concern of "${
    chat.specific_issue
  }". Address this issue using the appropriate FAQ and configuration data as reference. Use **${classification}-related actions**, such as refunds, cancellations, or order status updates, if enabled in the merchant's settings.
  
          ### Response Guidelines
          1. **Refunds**: If **refund** is requested and permitted, provide refund options based on merchant policy. Confirm with the customer before processing.
          2. **Cancellations**: If **order cancellation** is allowed, follow the steps to cancel and confirm with the customer.
          3. **Subscriptions**: Handle subscription issues using the merchant's subscription FAQ. If changes or cancellations are allowed, guide the customer through.
          4. **General Queries**: For questions on products, discounts, or giveaways, refer to the relevant FAQ sections or configuration settings.
  
          ### Additional Information
          Use links from the merchant's configuration if relevant:
          ${line_items}
  
          **Today's Date:** ${today}
  
          Respond promptly and confirm all actions taken. When ready, generate the response in markdown and submit it.
      `;
  return payload;
};
