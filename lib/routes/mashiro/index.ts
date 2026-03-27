import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

const baseUrl = `https://${namespace.url}`;

export const route: Route = {
    path: '/:lang',
    categories: ['blog'],
    example: '/mashiro/en',
    parameters: { lang: 'the language of the site. Can be either `en` or `zh-cn`. Default: `en`' },
    radar: [
        {
            source: ['mashiro.best/', 'mashiro.best/:lang/'],
        },
    ],
    name: `Blog`,
    maintainers: ['MuenYu'],
    handler: async (ctx) => {
        const { lang = 'en' } = ctx.req.param();
        const targetLink = lang === 'en' ? `${baseUrl}/archives/` : `${baseUrl}/${lang}/archives/`;
        const response = await ofetch(targetLink);
        const $ = load(response);
        const links = $('.archives-group article')
            .toArray()
            .slice(0, 10)
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();

                const title = a.find('.article-title').text();
                const link = `${baseUrl}${a.attr('href')}`;
                const pubDate = parseDate(a.find('time').attr('datetime'));

                return {
                    title,
                    link,
                    pubDate,
                };
            });

        const items = await Promise.all(
            links.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    item.description = $('.article-content').first().html();
                    return item;
                })
            )
        );

        return {
            title: namespace.name,
            link: targetLink,
            item: items,
        };
    },
};
