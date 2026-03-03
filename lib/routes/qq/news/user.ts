import type { DataItem, Route } from "@/types";
import cache from "@/utils/cache";
import ofetch from "@/utils/ofetch";
import { parseDate } from "@/utils/parse-date";
import { load } from "cheerio";

interface NewsItem {
    id: string;
    uinnick: string;
    articletype: string;
    longtitle: string;
    url: string;
    time: string;
    abstract: string;
    miniProShareImage: string;
}

export const route: Route = {
    path: "/news/:uid/:detail?",
    categories: ["social-media"],
    example: "/qq/news/8QMZ2X5a5YUeujw=",
    parameters: {
        uid: "用户 ID, 用户主页 URL 中的最后一段部分",
        detail: "是否抓取全文，该值只要不为空就抓取全文返回，否则只返回标题",
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ["https://news.qq.com/omn/author/:uid"],
            target: "/news/:uid",
        },
    ],
    name: "用户主页列表",
    maintainers: ["hualiong"],
    handler,
};

async function handler(ctx) {
    const { uid, detail } = ctx.req.param();
    const url = `https://i.news.qq.com/getSubNewsMixedList?guestSuid=${uid}&tabId=om_index`;
    const response = await ofetch<{ ret: number; newslist: NewsItem[] }>(url);

    let news = response.newslist.map((item) => ({
        title: item.longtitle,
        description: `<p>${item.abstract}</p><img src="${item.miniProShareImage}" />`,
        guid: item.id,
        link: item.url,
        pubDate: parseDate(item.time),
    }) satisfies DataItem);

    if (detail) {
        news = await Promise.all(
            response.newslist.map(async (item) =>
                cache.tryGet(item.id, async () => {
                    const description =
                        item.articletype === "0"
                            ? load(await ofetch(item.url))(".rich_media_content").html()!
                            : `<p>${item.abstract}</p><img src="${item.miniProShareImage}" /><h4>文章包含非文本内容，请在浏览器中打开查看</h4>`;
                    return {
                        title: item.longtitle,
                        description,
                        guid: item.id,
                        link: item.url,
                        pubDate: parseDate(item.time),
                    } satisfies DataItem;
                }),
            ),
        );
    }

    return {
        title: `${response.newslist[0].uinnick}的主页 - 腾讯网`,
        link: `https://news.qq.com/omn/author/${uid}`,
        item: news,
    };
}
