import { load } from "cheerio";

import type { Route } from "@/types";
import ofetch from "@/utils/ofetch";
import { parseDate } from "@/utils/parse-date";

export const route: Route = {
    path: "/research",
    categories: ["programming"],
    example: "/anthropic/research",
    parameters: {},
    radar: [
        {
            source: ["www.anthropic.com/research", "www.anthropic.com"],
        },
    ],
    name: "Research",
    maintainers: ["ttttmr"],
    handler,
    url: "www.anthropic.com/research",
};

async function handler() {
    const link = "https://www.anthropic.com/research";
    const response = await ofetch(link);
    const $ = load(response);

    const items = $('a[class*="PublicationList"]')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const title = $el.find('[class*="title"]').text().trim();
            const href = $el.attr("href");
            const pubDateText = $el.find('[class*="date"]').text().trim();

            if (!title || !href || href === "#") {
                return null;
            }

            return {
                title,
                link: `https://www.anthropic.com${href}`,
                pubDate: parseDate(pubDateText),
            };
        })
        .filter((item): item is Exclude<typeof item, null> => item !== null);

    return {
        title: "Anthropic Research",
        link,
        description: "Latest research from Anthropic",
        item: items,
    };
}
