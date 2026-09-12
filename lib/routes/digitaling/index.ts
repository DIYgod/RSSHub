import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/index',
    categories: ['new-media'],
    example: '/digitaling/index',
    name: '数英网最新文章',
    maintainers: ['occupy5'],
    handler,
};

async function handler() {
    const link = 'https://www.digitaling.com';
    const res = await ofetch(link);
    const $ = load(res);

    const list = $('#home_latest li h3')
        .find('a')
        .toArray()
        .map((e) => $(e).attr('href')!);

    const out = await Promise.all(
        list.map((itemUrl) =>
            cache.tryGet(itemUrl, async () => {
                const res = await ofetch(itemUrl);
                const $ = load(res);

                return {
                    title: $('.article_title h1, .project_title h1').text(),
                    author: $('#avatar_by').parent().find('h3 a').text(),
                    link: itemUrl,
                    description: $('#article_con').html(),
                    pubDate: parseDate($('#edit_url').parent().children().last().text()),
                };
            })
        )
    );

    return {
        title: '数英网-最新文章',
        link,
        item: out,
    };
}
