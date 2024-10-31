import * as AhoCorasick from "ahocorasick";
import {ChatDocument} from "../../types/chats";
import {ClassificationTypes, IssueTypes} from "../../types/shared";
import {classifyMessageGPT} from "../../../networking/openAi/classifciation";
import {EmailDocument} from "../../types/emails";

type CategoryKeywords = {
  [key in ClassificationTypes]: string[];
};

const raw_keywords: CategoryKeywords = {
  [ClassificationTypes.OrderStatus]: [
    "order status",
    "track my order",
    "has my order",
    "been shipped",
    "where is my order",
    "when will i receive",
    "already shipped",
    "package not delivered",
    "missing package",
    "lost shipment",
    "package never arrived",
    "where is my package",
    "check order shipment status",
    "has my package been dispatched?",
    "order tracking information",
    "delivery confirmation",
    "expected delivery time",
    "delayed order",
    "order stuck in transit",
    "where is my parcel now?",
    "package not received",
    "order status update",
    "when you would be sending",
    "see where my order is",
    "how do i track my order",
    "could tell me when this order will ship",
    "When will my order ship",
    "it's been over",
    "i have not received my order yet",
    "could track it",
    "make sure it's on the way",
    "is my order going to ship soon",
    "checking on the status",
    "order tracking",
    "where's my stuff",
    "checking on the order status",
    "when I can expect my purchase to arrive",
    "Just wondering where my order is",
    "getting shipped out",
    "how soon can I expect to receive my items",
    "going to be shipped",
    "I'm concerned that my order will not arrive",
    "why I haven't received my order",
    "i was just wanting to check",
    "can i still get apparel before christmas",
    "i haven't received my order yet",
    "how do i track it",
    "curious on possible eta of delivery",
    "it's been more than 2 weeks",
    "when will this be shipped",
    "wondering if my order will ship soon",
    "i'm checking on the order status",
    "why is my order saying unfulfilled",
    "it hasn't shipped yet",
    "trying to track order",
    "an estimated ship date",
    "when will I receive my hoodie",
    "why my order hasn't shipped yet",
    "why does my order say unfulfilled",
    "so far it is showing it is unfulfilled",
    "provide update on fulfillment status",
    "fulfillment status and shippong time",
    "how long standard shipping",
    "i never received my order",
    "when it's supposed to show up",
    "it hasn't even been shipped",
    "it has still not shipped",
    "have not received order or a tracking number",
    "i can't find my order confirmation and don't have any tracking",
    "when was it going to ship",
    "when I can expect to receive it please",
    "i am wondering when this order will ship",
    "wondering if they were shipped out yet",
    "haven't gotten any updates since",
    "when will my order be shipped",
    "if you could tell me how long it takes to ship out an order",
    "still has not been shipped out yet",
    "trying to locate a package",
    "when does my order arrive",
    "can you give me an update",
    "when should i expect my order",
    "wondering if you guys received and filled my order",
    "how about an update please",
    "checking the shipping status of my order",
    "when my order will be shipped",
    "it says deliverer",
    "still haven't received",
    "order has not been filled or shipped yet",
    "what's going on with my order",
    "a shipping label has been prepared for your item",
    "get an eta on my order",
    "eta",
    "curious about eta",
    "i placed my order on",
    "somewhere I can find my order status",
    "if my order shipped",
    "if it was shipped already",
    "when I should expect my order",
    "is there an estimated time of delivery for my order",
    "i need to find out an eta in my precious order",
    "just looking for tracking info",
    "where's my order",
    "just wanted an eta on my order",
    "what company do you use to ship your products",
    "order about 2 weeks ago",
    "update on shipping",
    "is there an estimated date",
    "expected arrival date",
    "when that is to be shipped",
    "tell me the status",
    "why is it taking so long to ship?",
    "what is the shipping turn around time",
    "if I order today will it get here before",
  ],
  [ClassificationTypes.Subscription]: [
    "my subscription",
    "why am i being charged",
    "use perks",
    "my perks",
    "my store credit",
    "cancel my subscription",
    "cancel subscription",
    "my credit is not working",
    "where is my credit",
    "delivery time",
    "when will it arrive",
    "shipping duration",
    "estimated delivery date",
    "when can I expect my order",
    "subscription renewal",
    "subscription charges",
    "subscription billing",
    "subscription cancellation process",
    "subscription benefits",
    "subscription renewal date",
    "subscription cost",
    "subscription perks",
    "subscription payment",
    "subscription refund",
    "what is the code",
    "how do i use",
    "manage subscriptions",
    "manage sub",
    "cancel my monthly subcription vip",
    "cancel for now",
    "cancel my VIP Club",
    "stop taking from my bank account",
    "how do I cancel",
    "unsubscribe",
    "i need to cancel my subscription",
    "cancel vip",
    "i was wondering if i had vip",
    "i would like to cancel my subscription",
    "I didn't know I signed up for",
    "vip club",
    "want to cancel membership",
    "all memberships please",
    "i'm having trouble finding all my coupons",
    "need to unsubscribe",
    "please cancel whatever subscription",
    "i've been charged",
    // "cancel", // This is too generic
    "cancel my subscrption",
    "i want my account to stop being drafted",
    "i want to cacel my subscription",
    "i would like to cancel",
    "can you cancel",
    "how do I cancel my subscription",
    "i want to cancel my monthly 'subscription'",
    "i never signed up for a monthly charge",
    "cancel this monthly charge",
  ],
  [ClassificationTypes.Giveaway]: [
    "how many entries",
    "the giveaway",
    "who won",
    "winner announced",
    "when is it announced",
    "free entries",
    "whats are my entries",
    "is this a scam",
    "saying I won",
    "they messaged me on social media",
    "i got a message on facebook",
    "did I win",
    "giveaway results",
    "winning notification",
    "claim prize",
    "giveaway legitimacy",
    "am I a winner",
    "giveaway rules",
    "entry confirmation",
    "how do I sign up for the truck promotion",
    "way to check and see if we won",
    "when is the giveaway",
    "how do I find out how many entries I have",
    "entries in the drawing",
    "entries in the giveaway",
    "The qr code isn't working",
    "end up with a blank page",
    "how many entries do i have",
  ],
  [ClassificationTypes.OrderAddress]: [
    "change my order address",
    "shipping address",
    "modify delivery details",
    "wrong address",
    "incorrect address",
    "update my shipping address",
    "change the delivery location",
    "edit shipping details",
    "need to modify my delivery address",
    "my address has changed",
    "delivery location change",
    "address correction",
    "update shipping info",
    "delivery address modification",
    "address change request",
    "edit delivery address",
    "wrong shipping address.",
  ],
  [ClassificationTypes.General]: [
    "how to contact",
    "how to use the store",
    "reset my password",
    "trouble logging in",
    "can't log in",
    "store opening hours",
    "what time do you close",
    "store hours of operation",
    "business hours",
    "store contact information",
    "contact support",
    "help with account",
    "store policies",
    "do y'all still sell kid/toddler clothes",
    "where is the gift shop",
    "do you still sell",
    "I can't remember my password",
    "password reset",
    "says that email doesn't exist",
    "i'm trying to log in to shop",
    "the site doesn't associate my email address with an account",
  ],
  [ClassificationTypes.Discount]: [
    "any discounts",
    "any promo",
    "how to apply discount",
    "discount on my order",
    "my discount is not working",
    "are there any current discounts available?",
    "how can I use a promotional code",
    "discount code not applying",
    "is there a coupon for my order",
    "i can't get the discount to work",
    "discount eligibility",
    "discount terms and conditions",
    "promo code application",
    "discount expiration date",
    "discount not applying correctly",
    "coupon usage instructions",
    "discount validity",
    "discount restrictions",
    "discount codes",
    "discount availability",
    "military discount",
    "where do your items ship from",
  ],
  [ClassificationTypes.OrderCancellation]: [
    "cancel",
    "want to cancel",
    "how to cancel an order",
    "how do i cancel",
    "cancel my recent purchase",
    "wanna cancel",
    "i've changed my mind, cancel my order",
    "cancel my recent purchase, please",
    "I want to cancel an order I placed",
    "how can I cancel my order",
    "please stop the order I made",
    "cancel my recent purchase order",
    "request order cancellation",
    "order cancellation policy",
    "cancellation confirmation",
    "cancel my order asap",
    "canceling an order placed by mistake",
    "cancel order before shipment",
    "cancellation fee",
    "canceling an online order",
    "cancellation time frame",
  ],
  [ClassificationTypes.OrderModification]: [
    "change my order",
    "modify my purchase",
    "edit order details",
    "change the size",
    "change the product",
    "wrong size",
    "wrong item",
    "wrong product",
    "item replacement",
    "swap my order",
    "exchange process",
    "it's not the one i ordered",
    "i received the wrong",
    "i wanted to see if I could change the shipping address",
    "i received the wrong product",
    "i accidently ordered",
    "if it hasn't shipped can't you change",
    "no idea how it was selected as a small",
    "i would like to exchange my order",
    "i am missing an item",
    "received a different item",
    "my shirt was not in my order",
  ],
  [ClassificationTypes.OrderRefund]: [
    "a refund",
    "it's damaged",
    "money back",
    "return my order",
    "refund my order",
    "return policy",
    "how to return",
    "return instructions",
    "can I return my order",
    "return process",
    "product warranty",
    "warranty coverage",
    "warranty information",
    "claim warranty",
    "warranty duration",
    "damaged product",
    "defective item",
    "product return",
    "return request",
    "refund policy",
    "exchange policy",
    "refund cancel order",
    "quality is not what I expected",
    "i'd like to be refunded for my full order",
    "then i'd just like a refund please",
    "how do I get a refund",
    "the print is crooked",
    "shirt shrunk",
  ],
  [ClassificationTypes.Product]: [
    "product availability",
    "product features",
    "product specifications",
    "product details",
    "product information",
    "product specs",
    "tell me about this product",
    "which sizes",
    "what sizes",
    "what colors",
    "do you still have",
    "where is made",
    "what are the sizes",
    "how does it fit",
    "shirt measurements",
    "hoodies measurments",
  ],
  [ClassificationTypes.None]: [],
};

const lowercaseKeywords = (keywords: CategoryKeywords): CategoryKeywords => {
  const result: CategoryKeywords = {} as CategoryKeywords;
  for (const c in keywords) {
    if (c) {
      const category = c as ClassificationTypes;
      result[category] = keywords[category].map((keyword) =>
        keyword.toLowerCase(),
      );
    }
  }
  return result;
};

const category_keywords = lowercaseKeywords(raw_keywords);

export const ac = new AhoCorasick(Object.values(category_keywords).flat());

type CategoryWeights = {
  [key in ClassificationTypes]: number;
};

export const category_weights: CategoryWeights = {
  [ClassificationTypes.OrderStatus]: 1,
  [ClassificationTypes.Subscription]: 1.5,
  [ClassificationTypes.Giveaway]: 1.5,
  [ClassificationTypes.OrderAddress]: 1.2,
  [ClassificationTypes.General]: 0.9,
  [ClassificationTypes.Discount]: 1,
  [ClassificationTypes.OrderCancellation]: 1,
  [ClassificationTypes.OrderModification]: 1,
  [ClassificationTypes.OrderRefund]: 1,
  [ClassificationTypes.Product]: 1.2,
  [ClassificationTypes.None]: 0.1,
};

export const classifyMessageAho = async (
  message: string,
): Promise<ClassificationTypes | null> => {
  const matches = ac.search(message.toLowerCase());
  if (matches.length === 0) return null;

  const category_counts: Partial<Record<ClassificationTypes, number>> = {};
  matches.forEach((match) => {
    match[1].forEach((phrases) => {
      for (const [category, keywords] of Object.entries(category_keywords)) {
        if (keywords.some((keyword) => phrases.includes(keyword))) {
          const category_key = category as ClassificationTypes;
          const weight = category_weights[category_key] || 0;
          category_counts[category_key] =
            (category_counts[category_key] || 0) + weight;
        }
      }
    });
  });

  let max_weighted = 0;
  let top_category: ClassificationTypes | null = null;
  Object.entries(category_counts).forEach(([category, count]) => {
    if (count > max_weighted) {
      max_weighted = count;
      top_category = category as ClassificationTypes;
    }
  });

  return max_weighted > 0 ? top_category : null;
};

export const classifyMessage = async (
  chat: ChatDocument | EmailDocument,
  message: string,
): Promise<ClassificationTypes> => {
  const aho = await classifyMessageAho(message);
  if (aho) return aho;

  const issue = chat && chat.issue ? chat.issue : "";
  const gpt = await classifyMessageGPT(message);
  if (!gpt) return classifyByIssue(issue);

  return gpt as ClassificationTypes;
};

const classifyByIssue = (issue: IssueTypes | ""): ClassificationTypes => {
  switch (issue) {
    case "exchange":
      return ClassificationTypes.OrderModification;
    case "general":
      return ClassificationTypes.General;
    case "order":
      return ClassificationTypes.OrderModification;
    case "refund":
      return ClassificationTypes.OrderRefund;
    case "shipping":
      return ClassificationTypes.OrderAddress;
    case "subscription":
      return ClassificationTypes.Subscription;
    default:
      return ClassificationTypes.None;
  }
};
