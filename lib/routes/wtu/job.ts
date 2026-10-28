import zlib from 'node:zlib';

import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://wtu.91wllm.com/';
const typeMap = new Map([
    ['xxtz', { title: '信息通知', url: `${baseUrl}news/index/tag/xxtz` }],
    ['tzgg', { title: '通知公告', url: `${baseUrl}news/index/tag/tzgg` }],
    ['xwkd', { title: '新闻快递', url: `${baseUrl}news/index/tag/xwkd` }],
]);
/**
 * Decode the source compression and Base64 layers.
 * @param {String} str
 * @returns {String}
 */
function decodeData(str: string) {
    // Match the source decoding expression.
    const regex = /Base64.decode\(unzip\("(.+?)"\)\.substr\((\d+)\)\)\.substr\((\d+)\)/;
    const match = str.match(regex);
    if (!match) {
        throw new Error('The job source no longer contains the expected encoded data. Check the source page format.');
    }
    // Read the encoded content and slice offsets.
    const compressedContent = match[1];
    const substr1Num = Number.parseInt(match[2]);
    const substr2Num = Number.parseInt(match[3]);
    // Inflate the compressed content.
    try {
        const unzipContent = zlib.inflateSync(Buffer.from(compressedContent, 'base64')).toString('utf8');
        const content = Buffer.from(unzipContent.slice(substr1Num), 'base64');
        return content.toString('utf8').slice(substr2Num);
    } catch (error) {
        throw new Error('Unable to decode the job source data. Check the source page format.', { cause: error });
    }
}
function parseJobDate(value: string) {
    const clock = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(clock)) {
        return;
    }
    const date = timezone(parseDate(clock, 'YYYY-MM-DD', true), 8);
    return Number.isNaN(date.getTime()) ? undefined : date;
}
export const route: Route = {
    path: '/job/:type',
    categories: ['university'],
    example: '/wtu/job/xxtz',
    parameters: { type: '信息类型' },
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
            source: ['wtu.91wllm.com/news/index/tag/:type'],
        },
    ],
    name: '就业信息',
    maintainers: ['ticks-tan'],
    handler,
    description: `| 信息类型 | 消息通知 | 通知公告 | 新闻快递 |
| -------- | -------- | -------- | -------- |
| 参数     | xxtz     | tzgg     | xwkd     |`,
};
async function handler(ctx) {
    // Resolve the requested information type.
    const type = ctx.req.param('type');
    const mapItem = typeMap.get(type);
    if (!mapItem) {
        throw new Error('Unsupported job information type. Use xxtz, tzgg, or xwkd.');
    }
    const msgTitle = `${mapItem.title} - 武汉纺织大学就业信息`;
    const link = mapItem.url;
    // Fetch the source listing.
    const resp = await got.get(link);
    // Decode the listing content.
    const listStr = decodeData(resp.data);
    // Parse the decoded listing.
    const $ = load(listStr);
    const list = $('.newsList')
        .toArray()
        .map(
            (
                item
            ): DataItem & {
                link: string;
            } => {
                const $item = $(item);
                const $date = $item.find("li[class='span2 y']").text();
                const $linkLi = $item.find('li>a');
                const $url = new URL($linkLi.attr('href')!, baseUrl).href;
                return {
                    title: $linkLi.text(),
                    pubDate: parseJobDate($date),
                    link: $url,
                };
            }
        );
    // Fetch and cache the complete article content.
    const items = await pMap<
        DataItem & {
            link: string;
        },
        DataItem
    >(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`${item.link}:body`, async () => {
                const { data: response } = await got.get(item.link);
                return { description: decodeData(response) };
            })),
        }),
        { concurrency: 3 }
    );
    return {
        title: msgTitle,
        link,
        description: msgTitle,
        item: items,
    };
}
