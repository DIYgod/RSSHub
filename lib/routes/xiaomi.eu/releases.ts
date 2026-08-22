import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/releases',
    categories: ['program-update'],
    example: '/xiaomi.eu/releases',
    name: 'ROM Releases',
    maintainers: ['maple3142'],
    handler,
};

async function handler() {
    const link = 'https://xiaomi.eu/community/forums/rom-releases.103/';
    const response = await ofetch(link);
    const $ = load(response);

    const forums = $('.node--forum .node-title a')
        .toArray()
        .map((el) => `https://xiaomi.eu${$(el).attr('href')}`);

    const lists = await Promise.all(
        forums.map((forum) =>
            cache.tryGet(
                forum,
                async () => {
                    const forumResponse = await ofetch(forum);
                    const $$ = load(forumResponse);
                    return $$('.structItem--thread')
                        .toArray()
                        .map((th) => {
                            const $th = $$(th);
                            const $ver = $th.find('.structItem-title>a:nth-child(1)');
                            const $title = $th.find('.structItem-title>a:nth-child(2)');
                            return {
                                title: `[${$ver.text()}] ${$title.text()}`,
                                link: `https://xiaomi.eu${$title.attr('href')}`,
                                updated: $th.find('.structItem-cell--latest time').attr('datetime')!,
                            };
                        });
                },
                config.cache.routeExpire,
                false
            )
        )
    );

    const list = lists
        .flat()
        .toSorted((a, b) => parseDate(b.updated).valueOf() - parseDate(a.updated).valueOf())
        .slice(0, 20);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const $$ = load(detailResponse);
                const floors = $$('.bbWrapper');

                return {
                    ...item,
                    description: floors
                        .slice(0, 2)
                        .toArray()
                        .map((el) => $$(el).html())
                        .join(''),
                    pubDate: parseDate($$('time').attr('datetime')!),
                };
            })
        )
    );

    return {
        title: 'Xiaomi.eu ROM Releases',
        link,
        item: items,
    };
}
