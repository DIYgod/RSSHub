// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const tag = ctx.req.param('tag') ?? '過去24小時';

    const rootUrl = 'https://global.udn.com';
    const currentUrl = `${rootUrl}/search/tagging/1020/${tag}`;
    const apiUrl = `${rootUrl}/search/ajax_tag/1020/${tag}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.articles.map((item) => ({
        title: item.TITLE,
        author: item.AUTHOR,
        pubDate: parseDate(item.TIMESTAMP * 1000),
        category: item.TAG.map((t) => t.tag),
        link: `${rootUrl}/global_vision/story/${item.CATE_ID}/${item.ART_ID}`,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('#story_art_title, #story_bady_info, #story_also').remove();
                content('.social_bar, .photo_pop, .only_mobile, .area').remove();

                item.author = content('#story_author_name').text();
                item.description = content('#tags').prev().html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `轉角國際 udn Global - ${tag}`,
        link: currentUrl,
        item: items,
    });
};
