import { load } from 'cheerio';
import iconv from 'iconv-lite';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

interface MobileChinanewsResponse {
    msgcode: number;
    data: {
        title: string;
        content: string;
        keywords?: string[];
    };
}

const fetchMobileChinanewsArticle = async (articleId: string) => {
    const response = await ofetch<MobileChinanewsResponse>(`https://dw.chinanews.com/cns/app/v1/wapDetail/content/${articleId}.json`, {
        query: { language: 'chs' },
    });
    if (response.msgcode !== 0 || !response.data?.title || !response.data.content) {
        throw new Error(`China News did not return the content of article ${articleId}.`);
    }
    const $ = load(response.data.content, undefined, false);
    $('.btpauthor, script, style').remove();
    const description = $.root().html();
    return {
        title: response.data.title,
        description,
        category: response.data.keywords?.filter(Boolean),
        content: { html: description, text: $.root().text() },
    };
};

export const handler = async (ctx) => {
    const { category = 'index/tzgg' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 20);

    const rootUrl = 'https://www.hubu.edu.cn';
    const currentUrl = `${rootUrl}/${category}.htm`;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language: Language = 'zh-CN';

    let items = $('div.list ul li')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const dateText = $item.find('span').text().replaceAll(/[[\]]/g, '').trim();
            const calendarDate = /^\d{4}-\d{2}-\d{2}$/.test(dateText);
            const date = dateText ? parseDate(dateText, calendarDate ? 'YYYY-MM-DD' : undefined, true) : undefined;

            return {
                title: $item.find('a').text(),
                pubDate: date && Number.isFinite(date.getTime()) ? (calendarDate ? timezone(date, 8) : date) : undefined,
                link: new URL($item.find('a').prop('href')!, rootUrl).href,
                language,
            };
        });

    items = items.slice(0, Math.max(20, limit));
    if (ctx.req.query('sorted') === 'false') {
        items = items.slice(0, limit);
    } else if (items.every((item) => item.pubDate instanceof Date && Number.isFinite(item.pubDate.getTime()))) {
        items.sort((a, b) => (b.pubDate as Date).getTime() - (a.pubDate as Date).getTime());
        items = items.slice(0, limit);
    }

    items = await pMap(
        items,
        async (item) => {
            const articleUrl = new URL(item.link);
            const mobileChinanews = articleUrl.hostname === 'm.chinanews.com' && /^\/wap\/detail\/chs\/[^/]+\/(\d+)\.shtml$/.exec(articleUrl.pathname);
            const detail = await cache.tryGet(`hubu:content:${mobileChinanews ? 'v3' : 'v2'}:${item.link}`, async () => {
                if (mobileChinanews) {
                    return fetchMobileChinanewsArticle(mobileChinanews[1]);
                }
                const { data: detailBuffer } = await got(item.link, { responseType: 'buffer' });
                const charset = /charset=["']?([^"'\s>;]+)/i.exec(detailBuffer.toString('ascii'))?.[1] ?? 'utf-8';
                const $$ = load(iconv.decode(detailBuffer, charset));
                const hubeiChinanews = articleUrl.hostname === 'www.hb.chinanews.com.cn';
                const title = $$('div.dtl-tit h4, div.con-tit h4').text() || (hubeiChinanews ? $$('.de_head .t1').text() : '');
                if (!title) {
                    return {};
                }
                const content = $$(hubeiChinanews ? '.de_article' : 'div.v_news_content').first();
                if (hubeiChinanews) {
                    content.find('#ad, .bianji, script, style').remove();
                }
                const description = content.html();
                return {
                    title,
                    description,
                    category: $$('META[Name="keywords"]')
                        .toArray()
                        .flatMap((c) => ($$(c).attr('content') ?? '').split(','))
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    content: {
                        html: description,
                        text: content.text(),
                    },
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    const title = $('title').text();
    const imageSrc = $('div.logo a img').prop('src');
    const image = imageSrc ? new URL(imageSrc, currentUrl).href : undefined;

    return {
        title,
        description: $('META[Name="keywords"]').prop('content'),
        link: currentUrl,
        item: items,
        image,
        author: title.split(/-/).pop(),
        language,
    };
};

export const route: Route = {
    path: '/www/:category{.+}?',
    name: '主页',
    url: 'hubu.edu.cn',
    maintainers: ['cijiugechu', 'nczitzk'],
    handler,
    example: '/hubu/www/index/tzgg',
    parameters: { category: '分类，可在对应分类页 URL 中找到，默认为[通知公告](https://www.hubu.edu.cn/index/tzgg.htm)' },
    description: `::: tip
若订阅 [通知公告](https://www.hubu.edu.cn/index/tzgg.htm)，网址为 \`https://www.hubu.edu.cn/index/tzgg.htm\`。截取 \`https://www.hubu.edu.cn/\` 到末尾 \`.htm\` 的部分 \`index/tzgg\` 作为参数填入，此时路由为 [\`/hubu/www/index/tzgg\`](https://rsshub.app/hubu/www/index/tzgg)。
:::

| 通知公告   | 学术预告   | 综合新闻   | 湖大要闻   | 媒体湖大   |
| ---------- | ---------- | ---------- | ---------- | ---------- |
| index/tzgg | index/xsyg | index/zhxw | index/hdyw | index/mthd |`,
    categories: ['university'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            title: '通知公告',
            source: ['hubu.edu.cn/index/tzgg.htm'],
            target: '/www/index/tzgg',
        },
        {
            title: '学术预告',
            source: ['hubu.edu.cn/index/xsyg.htm'],
            target: '/www/index/xsyg',
        },
        {
            title: '综合新闻',
            source: ['hubu.edu.cn/index/zhxw.htm'],
            target: '/www/index/zhxw',
        },
        {
            title: '湖大要闻',
            source: ['hubu.edu.cn/index/hdyw.htm'],
            target: '/www/index/hdyw',
        },
        {
            title: '媒体湖大',
            source: ['hubu.edu.cn/index/mthd.htm'],
            target: '/www/index/mthd',
        },
    ],
};
