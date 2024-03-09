import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:path?',
    categories: ['multimedia'],
    example: '/1lou/search-繁花.htm',
    parameters: { path: '路径信息在URL里找到,主页为 index' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['1lou.me/:path'],
        target: '/:path',
    },
    name: '搜索',
    maintainers: ['falling'],
    handler,
    description: `:::tip
  将 1lou.me/ 后的内容作为参数传入到 path 即可

  [www.1lou.me/search - 繁花.htm](http://www.1lou.me/search-繁花.htm) --> /1lou/search - 繁花.htm

  [www.1lou.me/forum-1.htm](http://www.1lou.me/forum-1.htm) --> /1lou/forum-1.htm

  [www.1lou.me/](http://www.1lou.me/) --> /1lou/
  :::`,
};

async function handler(ctx) {
    const path = ctx.req.param('path') ?? '';
    const rootUrl = `https://www.1lou.me`;
    const currentUrl = `${rootUrl}/${path}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = load(response.data);

    let items = $('li.media.thread.tap:not(.hidden-sm)')
        .toArray()
        .map((item) => {
            const title = $(item).find('.subject.break-all').children('a').first();
            const author = $(item).find('.username.text-grey.mr-1').text();
            const pubDate = $(item).find('.date.text-grey').text();
            return {
                title: title.text(),
                link: `${rootUrl}/${title.attr('href')}`,
                author,
                pubDate: timezone(parseDate(pubDate), +8),
            };
        });
    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                item.description = content('.message.break-all').html();
                const torrents = content('.attachlist').find('a');
                if (torrents.length > 0) {
                    item.enclosure_type = 'application/x-bittorrent';
                    item.enclosure_url = `${rootUrl}/${torrents.first().attr('href')}`;
                }

                return item;
            })
        )
    );
    return {
        title: '1Lou',
        link: currentUrl,
        item: items,
    };
}
