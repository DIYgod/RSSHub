import { load } from 'cheerio';

import { config } from '@/config';
import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.gov.cn';
const listUrl = `${rootUrl}/zhengce/jiedu/index.htm`;
const dataUrl = `${rootUrl}/zhengce/jiedu/ZCJD_QZ.json`;

export const route: Route = {
    path: '/zhengce/jiedu',
    categories: ['government'],
    example: '/gov/zhengce/jiedu',
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
            source: ['www.gov.cn/zhengce/jiedu/index.htm'],
            target: '/zhengce/jiedu',
        },
    ],
    name: '政策解读',
    maintainers: ['SettingDust', 'nczitzk'],
    handler,
    url: 'www.gov.cn/zhengce/jiedu/index.htm',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const [{ data: listResponse }, { data }] = await Promise.all([got(listUrl), got(dataUrl, { headers: { 'user-agent': config.trueUA } })]);

    const $ = load(listResponse);
    const items = data
        .slice(0, limit)
        .map((item) => ({
            title: item.TITLE,
            link: item.URL,
            pubDate: item.DOCRELPUBTIME ? timezone(parseDate(item.DOCRELPUBTIME), 8) : undefined,
        }))
        .filter((item) => item.link);

    const detailItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link, { headers: { 'user-agent': config.trueUA } });
                const content = load(detailResponse);

                const title = content('div.share-title').text();
                const description = content('div.TRS_UEDITOR').first().html() || content('div#UCAP-CONTENT, td#UCAP-CONTENT').first().html();

                if (!description) {
                    return item;
                }

                const author = content('meta[name="author"]').prop('content');
                const keywords = content('meta[name="keywords"]').prop('content')?.split(/;|,/) ?? [];
                const subject = content('td.zcwj_ztfl').text();
                const column = content('meta[name="lanmu"]').prop('content');
                const published = content('meta[name="firstpublishedtime"]').prop('content');

                return {
                    ...item,
                    title: title || item.title,
                    description,
                    author: author || undefined,
                    category: [...new Set([subject, column, ...keywords].filter(Boolean))],
                    pubDate: published ? timezone(parseDate(published, 'YYYY-MM-DD-HH:mm:ss'), 8) : item.pubDate,
                };
            })
        )
    );

    const logoPath = $('img.wordlogo').prop('src');
    const iconPath = $('link[rel="shortcut icon"]').prop('href') || $('link[rel="icon"]').prop('href');
    const image = logoPath ? new URL(logoPath, rootUrl).href : undefined;
    const icon = iconPath ? new URL(iconPath, rootUrl).href : undefined;
    const subtitle = $('meta[name="lanmu"]').prop('content');
    const author = $('div.header_logo a[aria-label]').prop('aria-label');
    const language: Language = 'zh-CN';

    return {
        title: author && subtitle ? `${author} - ${subtitle}` : $('title').text(),
        link: listUrl,
        item: detailItems,
        description: $('meta[name="description"]').prop('content'),
        language,
        image,
        icon,
        logo: icon,
        subtitle,
        author,
    };
}
