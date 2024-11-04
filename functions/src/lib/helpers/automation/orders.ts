import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

type LineItem = {
  quantity: number;
  options: string;
  title: string;
  variant_id: string;
  product_id: string;
};

export const checkForChangedLineItems = (
  gpt_line_items: LineItem[],
  chat: ChatDocument | EmailDocument,
) => {
  if (!chat.order) return null;

  const existing_line_items = chat.order.line_items;
  const modified_line_items: LineItem[] = [];

  if (gpt_line_items.length > existing_line_items.length) {
    for (const gptItem of gpt_line_items) {
      const filtered = gpt_line_items.filter((item) => {
        if (
          item.title == gptItem.title &&
          item.options.toLocaleLowerCase().replace(" ", "") ===
            gptItem.options.toLocaleLowerCase().replace(" ", "")
        ) {
          modified_line_items.push(gptItem);
        }
      });

      modified_line_items.concat(filtered);

      return modified_line_items;
    }
  }

  for (const gptItem of gpt_line_items) {
    const matching = existing_line_items.find(
      (item) => item.title === gptItem.title,
    );

    if (matching) {
      console.log({matching});
      if (
        matching.quantity !== gptItem.quantity ||
        matching.options.toLocaleLowerCase().replace(" ", "") !==
          gptItem.options.toLocaleLowerCase().replace(" ", "")
      ) {
        modified_line_items.push(gptItem);
      }
    } else {
      modified_line_items.push(gptItem);
    }
  }

  return modified_line_items;
};
