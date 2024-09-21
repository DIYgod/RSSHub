import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.ithome.com/';

export const route: Route = {
    path: '/tag/:name',
    categories: ['new-media'],
    example: '/ithome/tag/win11',
    parameters: { name: '标签名称，可从网址链接中获取' },
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
            source: ['ithome.com/tag/:name'],
        },
    ],
    name: '标签',
    maintainers: ['Fatpandac'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const url = `${rootUrl}tag/${name}`;

    const response = await got(url);
    const $ = load(response.data);
    const list = $('ul.bl > li')
        .map((_, item) => ({
            title: $(item).find('h2 > a').text(),
            link: $(item).find('h2 > a').attr('href'),
            pubDate: timezone(parseDate($(item).find('div.c').attr('data-ot')), +8),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                let detailResponse;

                // handle 404 errors for some article URLs
                try {
                    detailResponse = await got(item.link);
                } catch {
                    // empty
                }
                if (!detailResponse) {
                    return;
                }

                const content = load(detailResponse.data);

                const article = content('div.post_content');
                article.find('img[data-original]').each((_, ele) => {
                    ele = $(ele);
                    ele.attr('src', ele.attr('data-original'));
                    ele.removeAttr('class');
                    ele.removeAttr('data-original');
                });
                item.description = article.html();
                item.author = content('span.author_baidu > strong').text();

                return item;
            })
        )
    );

    return {
        title: `IT之家 - ${name}标签`,
        link: url,
        item: items.filter(Boolean),
    };
}
