// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const categories = {
    tracker: 123,
    feature: 124,
    opinion: 125,
};

export default async (ctx) => {
    const category = ctx.req.param('category') || '';
    const id = ctx.req.param('id') || '';

    const rootUrl = 'https://news.now.com';

    const currentUrl = Object.hasOwn(categories, category) ? `${rootUrl}/home/${category}/detail?catCode=${categories[category]}&topicId=${id}` : `${rootUrl}/home${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $(`${category === '' ? '.homeFeaturedNews ' : '.newsCategoryColLeft '}.newsTitle`)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.parent().parent().attr('href')}`,
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

                const images = detailResponse.data.match(/"imageUrl":"(.*?)","image2Url":/);

                item.pubDate = parseDate(content('.published').attr('datetime'));
                item.description = (images ? `<img src="${images[1]}">` : '') + content('.newsLeading').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: String(Object.hasOwn(categories, category) ? $('title').text() : ($('.smallSpace.active').text() || '首頁') + ' | Now 新聞'),
        link: currentUrl,
        item: items,
    });
};
