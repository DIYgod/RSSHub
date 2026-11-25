import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';
import { isOnSite } from '@/utils/valid-host';

import { getAcwScV2ByArg1 } from '../5eplay/utils';

export const route: Route = {
    path: '/:node',
    categories: ['traditional-media'],
    example: '/ycwb/1',
    parameters: { node: '栏目 id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻',
    maintainers: ['TimWu007'],
    handler,
    description: `注：小部分栏目的 URL 会给出 nodeid。如未给出，可打开某条新闻链接后，查看网页源代码，搜索 nodeid 的值。

常用栏目节点：

| 首页 | 中国 | 国际 | 体育 | 要闻 | 珠江评论 | 民生观察 | 房产 | 金羊教育 | 金羊财富 | 金羊文化 | 金羊健康 | 金羊汽车 |
| ---- | ---- | ---- | ---- | ---- | -------- | -------- | ---- | -------- | -------- | -------- | -------- | -------- |
| 1    | 14   | 15   | 16   | 22   | 1875     | 21773    | 222  | 5725     | 633      | 5281     | 21692    | 223      |

| 广州 | 广州 - 广州要闻 | 广州 - 社会百态 | 广州 - 深读广州 | 广州 - 生活服务 | 今日大湾区 | 广东 - 政经热闻 | 广东 - 民生视点 | 广东 - 滚动新闻 |
| ---- | --------------- | --------------- | --------------- | --------------- | ---------- | --------------- | --------------- | --------------- |
| 18   | 5261            | 6030            | 13352           | 83422           | 100418     | 13074           | 12252           | 12212           |`,
};
type ListedItem = DataItem & {
    description: string;
    link: string;
};
async function handler(ctx) {
    const node = ctx.req.param('node') ?? 1;
    const currentUrl = `https://6api.ycwb.com/app_if/jy/getArticles?nodeid=${node}&pagesize=15`;
    const { data: response } = await got(currentUrl);
    const list: ListedItem[] = response.artiles.map((item) => ({
        title: item.TITLE,
        description: renderToString(
            <>
                {getPictureUrls(item.PICLINKS, item.PICS).map((src) => (
                    <>
                        <img src={src} />
                        <br />
                    </>
                ))}
                {item.ABSTRACT ? (
                    <>
                        <blockquote>
                            <p>{item.ABSTRACT}</p>
                        </blockquote>
                        <br />
                    </>
                ) : null}
            </>
        ),
        pubDate: parseDate(item.PUBTIME, 8),
        link: item.PUBURL,
        category: [item.NODENAME],
    }));
    const nodeName = response.artiles[0]?.NODENAME ?? '';
    const items = await pMap(
        list,
        async (item) => {
            // only follow links on the site itself
            if (!isOnSite(item.link, 'ycwb.com')) {
                return { item, nodeLinks: [] };
            }
            const details = await cache.tryGet(`ycwb:article:v4:${item.link}`, () => fetchArticleDetails(item.link));
            return { item: { ...item, description: details.description || item.description, author: details.author }, nodeLinks: details.nodeLinks };
        },
        { concurrency: 3, stopOnError: false }
    );
    const nodeLink = items.flatMap((entry) => entry.nodeLinks).find((entry) => entry.name === nodeName)?.link;
    return {
        title: `羊城晚报金羊网 - ${nodeName}`,
        link: nodeLink || 'https://www.ycwb.com/',
        item: items.map((entry) => entry.item),
    };
}
type ArticleDetails = Pick<DataItem, 'author'> & {
    description: string;
    nodeLinks: Array<{
        name: string;
        link?: string;
    }>;
};

async function fetchArticleDetails(link: string): Promise<ArticleDetails> {
    let { data } = await got({ method: 'get', url: link });
    const arg1 = data.match(/var arg1='(.*?)'/)?.[1];
    if (arg1) {
        ({ data } = await got({ method: 'get', url: link, headers: { cookie: `acw_sc__v2=${getAcwScV2ByArg1(arg1)}` } }));
    }
    const $ = load(data);
    if (!$('.main_article').length) {
        throw new Error(`Unable to find main article content: ${link}`);
    }
    let author: string | undefined;
    const comments = $('.main_article')
        .contents()
        .filter((_, element) => element.nodeType === 8);
    comments.each((_, element) => {
        // Remove unused audio player comments.
        if (/audioPlayer|audio-box/.test(element.data)) {
            element.data = '';
        }
        const authorMatch = element.data.match(/<author>([\s\S]*?)<\/author>/);
        if (!authorMatch) {
            return;
        }
        author = authorMatch[1] || undefined;
        element.data = element.data.replace(authorMatch[0], '');
        if (!element.data) {
            $(element).remove();
        }
    });
    const nodeLinks = $('.path a')
        .toArray()
        .map((element) => ({ name: $(element).text(), link: $(element).attr('href') }));
    $('span, br, p').removeAttr('style').removeAttr('class');
    $('img').removeAttr('style').removeAttr('class').removeAttr('placement').removeAttr('data-toggle').removeAttr('trigger');
    $('.space10, .ddf').remove();
    return { description: $('.main_article').html() ?? '', author, nodeLinks };
}
function getPictureUrls(picLinks: string, pictures: Array<{ attpath: string }>): string[] {
    return picLinks ? [picLinks] : [...new Set(pictures.map((picture) => picture.attpath))];
}
