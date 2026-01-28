import type { Route } from "@/types";

import { fetchShui5cnCategory } from "./utils";

export const route: Route = {
  path: "/fagui-jiedu",
  categories: ["finance"],
  example: "/shui5cn/fagui-jiedu",
  parameters: {},
  features: {
    requireConfig: false,
    requirePuppeteer: true,
    antiCrawler: true,
    supportBT: false,
    supportPodcast: false,
    supportScihub: false,
  },
  radar: [
    {
      source: ["shui5.cn/article/FaGuiJieDu/"],
      target: "/fagui-jiedu",
    },
  ],
  name: "法规解读",
  maintainers: ["anuxs"],
  handler,
  url: "shui5.cn/article/FaGuiJieDu/",
};

async function handler() {
  return await fetchShui5cnCategory({
    categoryPath: "FaGuiJieDu",
    categoryName: "法规解读",
    categoryLabel: "法规解读",
  });
}
