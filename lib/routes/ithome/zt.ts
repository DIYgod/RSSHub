import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/zt/:id',
    categories: ['new-media'],
    example: '/ithome/zt/xijiayi',
    parameters: { id: '专题 id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['ithome.com/zt/:id'],
    },
    name: '专题',
    maintainers: ['nczitzk'],
    handler,
    description: `所有专题请见[此处](https://www.ithome.com/zt)`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://www.ithome.com';
    const currentUrl = `${rootUrl}/zt/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.newsbody a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);
                const post = content('.post_content');

                post.find('img[data-original]').each((_, ele) => {
                    ele = $(ele);
                    ele.attr('src', ele.attr('data-original'));
                    ele.removeAttr('class');
                    ele.removeAttr('data-original');
                });

                item.description = post.html();
                item.author = content('#author_baidu').text().replace('作者：', '');
                item.pubDate = timezone(parseDate(content('#pubtime_baidu').text()), +8);

                return item;
            })
        )
    );

    return {
        title: `${$('title').text()} - IT之家`,
        link: currentUrl,
        item: items,
    };
}
