import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

type ArticleDetails = Pick<DataItem, 'description' | 'author' | 'updated'>;
type XiumiDocument = {
    cubes: Array<{
        pages: Array<{
            layers: Array<{
                _comp: {
                    _$raHTML: string;
                };
            }>;
        }>;
    }>;
};
async function fetchArticleDetails(link: string): Promise<ArticleDetails> {
    const response = await ofetch(link);
    if (new URL(link).hostname === 'c.xiumius.cn') {
        const encodedInfo = response.match(/injectedData\.showInfo\s*=\s*JSON\.parse\(decodeURIComponent\("([^"]+)"/);
        if (encodedInfo) {
            const info: {
                show_data_url: string;
                owner: {
                    nickname: string;
                };
                updated_at: string;
            } = JSON.parse(decodeURIComponent(encodedInfo[1]));
            const document = await ofetch<XiumiDocument>(new URL(info.show_data_url, link).href);
            return {
                description: document.cubes
                    .flatMap((cube) => cube.pages)
                    .flatMap((page) => page.layers)
                    .map((layer) => layer._comp._$raHTML)
                    .join(''),
                author: info.owner.nickname,
                updated: parseDate(info.updated_at),
            };
        }
    }
    const $ = load(response);
    return { description: $('.v_news_content').html() };
}
export const route: Route = {
    path: '/lib/tzgg/:category?',
    url: 'lib.tsinghua.edu.cn',
    categories: ['university'],
    example: '/tsinghua/lib/tzgg/qtkx',
    parameters: { category: '分类，可在对应分类页 URL 中找到，留空则获取全局通知公告' },
    description: `| 全部 | 开馆通知 | 施工维修 | 服务通知 | 违规通报 | 清图快讯 | 馆际通知 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- |
| 留空 | kgtz     | sgwx     | fwtz     | wgtb     | qtkx     | gjtz     |`,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['lib.tsinghua.edu.cn/tzgg.htm'],
            target: '/lib/tzgg',
        },
        {
            source: ['lib.tsinghua.edu.cn/tzgg/kgtz.htm'],
            target: '/lib/tzgg/kgtz',
        },
        {
            source: ['lib.tsinghua.edu.cn/tzgg/sgwx.htm'],
            target: '/lib/tzgg/sgwx',
        },
        {
            source: ['lib.tsinghua.edu.cn/tzgg/fwtz.htm'],
            target: '/lib/tzgg/fwtz',
        },
        {
            source: ['lib.tsinghua.edu.cn/tzgg/wgtb.htm'],
            target: '/lib/tzgg/wgtb',
        },
        {
            source: ['lib.tsinghua.edu.cn/tzgg/qtkx.htm'],
            target: '/lib/tzgg/qtkx',
        },
        {
            source: ['lib.tsinghua.edu.cn/tzgg/gjtz.htm'],
            target: '/lib/tzgg/gjtz',
        },
    ],
    name: '图书馆通知公告',
    maintainers: ['linsenwang', 'Aquarius-Situla'],
    handler,
};
async function handler(ctx) {
    /* Determine the target URL based on whether a specific category is requested */
    const { category } = ctx.req.param();
    const host = category ? `https://lib.tsinghua.edu.cn/tzgg/${category}.htm` : 'https://lib.tsinghua.edu.cn/tzgg.htm';
    const response = await ofetch(host);
    const $ = load(response);
    /* Extract the feed title, either the specific category name or the global title */
    const feedTitle = category ? $('.tags .on').text() : '通知公告';
    /* Extract the logo image URL to be used as the feed icon */
    const imageUrl = $('div.logo a img').attr('src');
    const image = imageUrl ? new URL(imageUrl, host).href : undefined;
    /* Parse the list of notices and extract metadata for each item */
    const list = $('ul.notice-list li')
        .toArray()
        .filter((item) => $(item).find('a').attr('href'))
        .map(
            (
                item
            ): DataItem & {
                link: string;
            } => {
                const $item = $(item);
                const title = $item.find('a').text();
                const time = $item.find('.notice-date').text();
                const a = $item.find('a').attr('href');
                const itemCategory = category ? feedTitle : $item.find('.notice-label').text();
                const fullUrl = new URL(a!, host).href;
                return {
                    title,
                    link: fullUrl,
                    pubDate: parseDate(time, 'YYYY/MM/DD', 8),
                    category: itemCategory,
                };
            }
        );
    /* Fetch full article content for each notice using RSSHub's cache mechanism */
    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`tsinghua:lib:tzgg:detail:${item.link}`, () => fetchArticleDetails(item.link));
            return { ...item, description: details.description, author: details.author, updated: details.updated };
        },
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: '图书馆通知公告 - ' + feedTitle,
        link: host,
        image,
        item: items,
    };
}
