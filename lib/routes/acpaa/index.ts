import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id?/:name?',
    categories: ['other'],
    example: '/acpaa',
    parameters: { id: '标签 id，默认为 1，可在对应标签页 URL 中找到', name: '标签名称，默认为重要通知，可在对应标签页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '标签',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const { id = '1', name = '重要通知' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'http://www.acpaa.cn';
    const currentUrl = new URL(`article/taglist.jhtml?tagIds=${id}&tagname=${name}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.text01 ul li a[title]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.prop('title'),
                link: new URL(item.prop('href'), rootUrl).href,
                pubDate: timezone(parseDate(item.find('span[title]').prop('title')), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('div.xhjj_head01').text();
                item.description = content('div.text01').html();

                return item;
            })
        )
    );

    const author = $('title').text().replaceAll('-', '');
    const subtitle = $('span.myTitle').text().trim();

    return {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: 'zh',
        subtitle,
        author,
    };
}
