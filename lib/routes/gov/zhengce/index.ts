import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/zhengce/zuixin', '/zhengce/:category{.+}?'],
    categories: ['government'],
    example: '/gov/zhengce/zuixin',
    parameters: {},
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
            source: ['www.gov.cn/zhengce/zuixin.htm', 'www.gov.cn/'],
        },
    ],
    name: '最新政策',
    maintainers: ['SettingDust', 'nczitzk'],
    handler,
    url: 'www.gov.cn/zhengce/zuixin.htm',
};

async function handler(ctx) {
    const { category = 'zuixin' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://www.gov.cn';
    const currentUrl = new URL(`zhengce/${category.replace(/\/$/, '')}/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('h4 a, div.subtitle a[title]')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.prop('href');

            return {
                title: item.text(),
                link: link.startsWith('http') ? link : new URL(link, currentUrl).href,
            };
        });

    items = await Promise.all(
        items
            .filter((item) => /https?:\/\/www\.gov\.cn\/zhengce.*content_\d+\.htm/.test(item.link))
            .slice(0, limit)
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    const { data: detailResponse } = await got(item.link);

                    const content = load(detailResponse);

                    const processElementText = (el) => content(el).text().split(/：/).pop().trim() || content(el).next().text().trim();

                    const author = content('meta[name="author"]').prop('content');

                    const agencyEl = content('table.bd1')
                        .find('td')
                        .toArray()
                        .findLast((a) => content(a).text().startsWith('发文机关'));

                    const sourceEl = content('span.font-zyygwj')
                        .toArray()
                        .findLast((a) => content(a).text().startsWith('来源'));

                    const subjectEl = content('table.bd1')
                        .find('td')
                        .toArray()
                        .findLast((a) => content(a).text().startsWith('主题分类'));

                    const agency = agencyEl ? processElementText(agencyEl) : undefined;
                    const source = sourceEl ? processElementText(sourceEl) : undefined;
                    const subject = subjectEl ? processElementText(subjectEl) : content('td.zcwj_ztfl').text();

                    const column = content('meta[name="lanmu"]').prop('content');
                    const keywords = content('meta[name="keywords"]').prop('content')?.split(/;|,/) ?? [];
                    const manuscriptId = content('meta[name="manuscriptId"]').prop('content');

                    item.title = content('div.share-title').text() || item.title;
                    item.description = content('div.TRS_UEDITOR').first().html() || content('div#UCAP-CONTENT, td#UCAP-CONTENT').first().html();
                    item.author = [agency, source, author].filter(Boolean).join('/');
                    item.category = [...new Set([subject, column, ...keywords].filter(Boolean))];
                    item.guid = `gov-zhengce-${manuscriptId}`;
                    item.pubDate = timezone(parseDate(content('meta[name="firstpublishedtime"]').prop('content'), 'YYYY-MM-DD-HH:mm:ss'), +8);
                    item.updated = timezone(parseDate(content('meta[name="lastmodifiedtime"]').prop('content'), 'YYYY-MM-DD-HH:mm:ss'), +8);

                    return item;
                })
            )
    );

    const image = new URL($('img.wordlogo').prop('src'), rootUrl).href;
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;
    const subtitle = $('meta[name="lanmu"]').prop('content');
    const author = $('div.header_logo a[aria-label]').prop('aria-label');

    return {
        item: items,
        title: author && subtitle ? `${author} - ${subtitle}` : $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-CN',
        image,
        icon,
        logo: icon,
        subtitle,
        author,
    };
}
