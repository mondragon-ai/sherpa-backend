import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {ChangeProductLineItem} from "../../types/openai/products";

type LineItem = {
  quantity: number;
  options: string;
  title: string;
  variant_id: string;
  product_id: string;
};

export const checkForChangedLineItems = (
  gpt_line_items: ChangeProductLineItem[],
  chat: ChatDocument | EmailDocument,
) => {
  if (!chat.order) return null;

  /* eslint-disable operator-linebreak */
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
  /* eslint-enable operator-linebreak */

  return modified_line_items;
};
