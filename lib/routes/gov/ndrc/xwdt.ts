import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/ndrc/xwdt/:category{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') || 'xwfb';

    const rootUrl = 'https://www.ndrc.gov.cn';
    const currentUrl = category.includes('dt') ? `${rootUrl}/xwdt/dt/${category}` : `${rootUrl}/xwdt/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const list = $('.u-list li a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            let link = item.attr('href');
            if (link.indexOf('../../..') === 0) {
                link = `${rootUrl}${link.replace('../../..', '')}`;
            } else if (link.indexOf('.') === 0) {
                link = `${currentUrl}${link.replace('.', '')}`;
            }
            return {
                title: item.text(),
                link,
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

                item.description = content('.TRS_Editor').html() || content('.article_con').html();
                item.pubDate = new Date(content('meta[name="PubDate"]').attr('content') + ' GMT+8').toUTCString();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
