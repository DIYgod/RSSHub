import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

async function fetchArticleDetails(link: string): Promise<Pick<DataItem, 'title' | 'description' | 'content'>> {
    const { data: response } = await got(link);
    const $ = load(response);
    const body = $('div.v_news_content');
    const description = body.html();

    return {
        title: $('h2').text(),
        description,
        content: { html: description, text: body.text() },
    };
}

export const handler = async (ctx) => {
    const { category } = ctx.req.param();
    const limit = getRouteLimit(ctx, 10);

    const rootUrl = 'https://lib.tsinghua.edu.cn';
    const currentUrl = new URL(`zydt${category ? `/${category}` : ''}.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang') as Language;

    let items = $('ul.notice-list li')
        .slice(0, limit)
        .toArray()
        .filter((item) => $(item).find('div.notice-list-tt a').attr('href'))
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const date = $item.find('div.notice-date').text();

            return {
                title: $item.find('div.notice-list-tt a').text(),
                pubDate: date ? timezone(parseDate(date, 'YYYY/MM/DD'), 8) : undefined,
                link: new URL($item.find('div.notice-list-tt a').prop('href')!, rootUrl).href,
                category: $item
                    .find('div.notice-label')
                    .toArray()
                    .map((c) => $(c).text()),
                language,
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet(item.link, () => fetchArticleDetails(item.link));

            return { ...item, title: details.title || item.title, description: details.description, content: details.content };
        },
        { concurrency: 3, stopOnError: false }
    );

    const title = $('title').text();
    const imageUrl = $('div.logo a img').prop('src');
    const image = imageUrl ? new URL(imageUrl, currentUrl).href : undefined;

    return {
        title,
        description: $('META[Name="keywords"]').prop('Content'),
        link: currentUrl,
        item: items,
        image,
        author: title.split(/-/).pop(),
        language,
    };
};

export const route: Route = {
    path: '/lib/zydt/:category?',
    name: '图书馆资源动态',
    url: 'lib.tsinghua.edu.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/tsinghua/lib/zydt',
    parameters: { category: '分类，默认为空，即全部，可在对应分类页 URL 中找到' },
    description: `::: tip
若订阅 [清华大学图书馆已购资源动态](https://lib.tsinghua.edu.cn/zydt/yg.htm)，网址为 \`https://lib.tsinghua.edu.cn/zydt/yg.htm\`。截取 \`https://lib.tsinghua.edu.cn/zydt\` 到末尾 \`.htm\` 的部分 \`yg\` 作为参数填入，此时路由为 [\`/tsinghua/lib/zydt/yg\`](https://rsshub.app/tsinghua/lib/zydt/yg)。
:::

| 已购 | 试用 |
| ---- | ---- |
| yg   | sy   |`,
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
            source: ['lib.tsinghua.edu.cn/zydt.htm'],
            target: '/lib/zydt',
        },
        {
            source: ['lib.tsinghua.edu.cn/zydt/yg.htm'],
            target: '/lib/zydt/yg',
        },
        {
            source: ['lib.tsinghua.edu.cn/zydt/sy.htm'],
            target: '/lib/zydt/sy',
        },
    ],
};
