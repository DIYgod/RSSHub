// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const host = 'https://support.typora.io';

    const { data } = await got(`${host}/store/`);

    const list = Object.values(data)
        .filter((i) => i.category === 'new')
        .map((i) => ({
            title: i.title,
            author: i.author,
            description: i.content,
            link: `${host}${i.url}`,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = load(data);

                item.pubDate = parseDate($('.post-meta time').text());
                item.description = $('#post-content').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'Typora Changelog',
        link: host,
        description: 'Typora Changelog',
        image: `${host}/assets/img/favicon-128.png`,
        item: items,
    });
};
