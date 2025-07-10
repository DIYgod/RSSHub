import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/hot/:bsn',
    categories: ['anime'],
    view: ViewType.Articles,
    example: '/gamer/hot/47157',
    parameters: { bsn: '板塊 id，在 URL 可以找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '熱門推薦',
    maintainers: ['nczitzk', 'TonyRL'],
    handler,
};

async function handler(ctx) {
    const rootUrl = `https://forum.gamer.com.tw/A.php?bsn=${ctx.req.param('bsn')}`;
    const response = await got({
        url: rootUrl,
        headers: {
            Referer: 'https://forum.gamer.com.tw',
        },
    });

    const $ = load(response.data);
    const list = $('div.FM-abox2A a.FM-abox2B')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                link: `https:${item.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    url: item.link,
                    headers: {
                        Referer: rootUrl,
                    },
                });
                const content = load(detailResponse.data);

                content('div.c-post__body__buttonbar').remove();

                item.title = content('.c-post__header__title').text();
                item.description = content('div.c-post__body').html();
                item.author = `${content('a.username').eq(0).text()} (${content('a.userid').eq(0).text()})`;
                item.pubDate = timezone(parseDate(content('a.edittime').eq(0).attr('data-mtime'), +8));

                return item;
            })
        )
    );

    const ret = {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };

    ctx.set('json', ret);
    return ret;
}
