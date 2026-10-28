import { load } from 'cheerio';
import iconv from 'iconv-lite';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { fixArticleContent } from '@/utils/wechat-mp';

const gbk2utf8 = (s) => iconv.decode(s, 'gbk');
export const route: Route = {
    path: '/xyxw',
    categories: ['university'],
    example: '/stbu/xyxw',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['stbu.edu.cn/html/news/xueyuan', 'stbu.edu.cn'],
        },
    ],
    name: '学院新闻',
    maintainers: ['HyperCherry'],
    handler,
    url: 'stbu.edu.cn/html/news/xueyuan',
};

async function handler() {
    const baseUrl = 'http://www.stbu.edu.cn';
    const requestUrl = `${baseUrl}/html/news/xueyuan/`;
    const { data: response } = await got(requestUrl, {
        responseType: 'buffer',
    });
    const $ = load(gbk2utf8(response));
    const list: Array<DataItem & { link: string }> = $('a.news-item')
        .toArray()
        .flatMap((item) => {
            const $item = $(item);
            const href = $item.attr('href');
            if (!href) {
                return [];
            }
            const year = $item.find('.news-date-year').text();
            const monthDay = $item.find('.news-date-month').text();
            return {
                title: $item.find('.news-title').text(),
                link: new URL(href, baseUrl).href,
                pubDate: year && monthDay ? parseDate(`${year}-${monthDay}T00:00:00Z`) : undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`stbu:campus:v3:${item.link}`, async () => {
                const response = await ofetch.raw(item.link, { responseType: 'arrayBuffer' });
                if (!response._data) {
                    throw new NotFoundError(`Article response is missing at ${item.link}`);
                }
                const isWeChat = new URL(response.url).hostname === 'mp.weixin.qq.com';
                const bytes = Buffer.from(response._data);
                const text = isWeChat ? bytes.toString('utf8') : gbk2utf8(bytes);
                const content = load(text);
                if (isWeChat) {
                    content('#js_content iframe[data-src]').each((_, frame) => {
                        const element = content(frame);
                        const source = element.attr('data-src');
                        if (source) {
                            element.attr('src', source).removeAttr('data-src');
                        }
                    });
                }
                const description = isWeChat ? fixArticleContent(content('#js_content')) : content('.article-content').last().html();
                if (!description) {
                    throw new NotFoundError(`Article content is missing at ${item.link}`);
                }
                const epoch = isWeChat ? /\bct\s*=\s*['"](\d+)['"]/.exec(text)?.[1] : undefined;
                const info = content('.article-info').text();
                const date = /发布时间：\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/.exec(info)?.[1];
                return {
                    description,
                    author: isWeChat ? content('meta[name="author"]').attr('content') : /作者：([^|]+)/.exec(info)?.[1].trim(),
                    pubDate: epoch ? parseDate(Number(epoch) * 1000) : date ? parseDate(`${date} +0800`, 'YYYY-MM-DD HH:mm ZZ') : undefined,
                };
            });
            return { ...item, ...detail, pubDate: detail.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        title: '四川工商学院 - 学院新闻',
        link: requestUrl,
        description: '四川工商学院 - 学院新闻',
        item: items,
    };
}
