import { createCn } from "cn/config";

/*
 * Class merging that knows our custom type scale. Without this, `text-h4`
 * and `text-ink` are both treated as text colours and one of them is dropped.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["caption", "body-sm", "body", "h4", "h3", "h2", "h1"] }],
    },
  },
});
