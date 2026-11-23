import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

import { parseCalendarDate } from './util';

const baseUrl = 'https://cs.whu.edu.cn';
class ArticleAccessError extends Error {}
export const route: Route = {
    path: '/cs/:type',
    categories: ['university'],
    example: '/whu/cs/2',
    parameters: { type: '公告类型，详见表格' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机学院公告',
    maintainers: ['ttyfly'],
    handler,
    description: `| 公告类型 | 学院新闻 | 学术交流 | 通知公告 | 科研进展 |
| -------- | -------- | -------- | -------- | -------- |
| 参数     | 0        | 1        | 2        | 3        |`,
};
async function handler(ctx) {
    const type = Number.parseInt(ctx.req.param('type'));
    let link;
    switch (type) {
        case 0:
            link = `${baseUrl}/xwdt/xyxw.htm`; // School news
            break;
        case 1:
            link = `${baseUrl}/kxyj/xsjl.htm`; // Academic exchanges
            break;
        case 2:
            link = `${baseUrl}/xwdt/tzgg.htm`; // Notices
            break;
        case 3:
            link = `${baseUrl}/kxyj/kyjz.htm`; // Research progress
            break;
        default:
            throw new Error(`Unknown type: ${type}`);
    }
    const response = await got(link);
    const $ = load(response.data);
    const list = $('div.study ul li')
        .toArray()
        .map(
            (
                item
            ): DataItem & {
                link: string;
            } => {
                const $item = $(item);
                return {
                    title: $item.find('a p').text(),
                    pubDate: parseCalendarDate($item.find('span').text()),
                    link: new URL($item.find('a').attr('href')!, link).href,
                };
            }
        );
    const results = await pMap(
        list,
        async (item) => {
            try {
                const detail = await cache.tryGet(`whu:cs:main-content:${item.link}`, async () => {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    if ($('.prompt').length || ($('title').text() === '用户验证' && $('body').text().includes('验证码'))) {
                        throw new ArticleAccessError(`Article access permission or verification required at ${item.link}`);
                    }
                    // Campus-only articles either redirect to the CAS login or show a no-permission notice in place of the body
                    if ($('script').text().includes('cas.whu.edu.cn/authserver/login') || $('[id^="vsb_content"]').text().includes('您无权限访问该条文章')) {
                        throw new ArticleAccessError(`Article access authentication required at ${item.link}`);
                    }
                    const content = $('.v_news_content');
                    content.find('style').remove();
                    const downloads = $('.content a[href*="news.DownloadAttachUrl"]').filter((_, element) => $(element).parents('.v_news_content').length === 0);
                    content.find('img').each((_, element) => {
                        const image = $(element);
                        const src = image.attr('orisrc');
                        if (src) {
                            image.attr('src', src);
                        }
                        image.removeAttr('orisrc');
                        image.removeAttr('vurl');
                    });
                    const attachments = downloads
                        .toArray()
                        .map((element) => `<li>${$.html(element)}</li>`)
                        .join('');
                    const category = $('meta[name="Keywords"]').attr('content')?.split(/\s+/).filter(Boolean);
                    return {
                        category,
                        description: content.html()! + (downloads.length ? `\n<ul>${attachments}</ul>` : ''),
                        publicationDate: $('meta[name="PubDate"]').attr('content'),
                    };
                });
                return {
                    ...item,
                    description: detail.description,
                    category: detail.category,
                    pubDate: detail.publicationDate ? parseDate(detail.publicationDate, 8) : item.pubDate,
                };
            } catch (error) {
                if (error instanceof ArticleAccessError || (error instanceof Error && error.name === 'FetchError')) {
                    return item;
                }
                throw error;
            }
        },
        { concurrency: 3 }
    );
    const items = results;
    return {
        title: $('title').text(),
        link,
        item: items,
    };
}
