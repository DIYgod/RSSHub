import { load } from 'cheerio';
import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/next/:url',
    categories: ['blog'],
    example: '/hexo/next/archive.diygod.me',
    parameters: { url: 'the blog URL without the protocol (http:// and https://)' },
    name: 'Blog using Next theme',
    maintainers: ['fengkx'],
    features: {
        requireConfig: [{ name: 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN', description: 'Allow user supplied domain' }],
    },
    handler,
};

async function handler(ctx: Context) {
    if (!config.feature.allow_user_supply_unsafe_domain) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }
    const url = `http://${ctx.req.param('url')}`;
    const res = await ofetch(`${url}/archives/`);
    const $ = load(res);

    const list = $('.post-header')
        .slice(0, 5)
        .toArray()
        .map((element) => {
            const each = $(element);
            const storyLink = each.find('.post-title-link').attr('href');
            return {
                title: each.find('[itemprop=name]').text(),
                link: new URL(storyLink!, url).href,
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const storyDetail = await ofetch(item.link);
                const $ = load(storyDetail);

                return {
                    ...item,
                    pubDate: parseDate($('time').attr('datetime')!),
                    description: $('.post-body').html(),
                };
            })
        )
    );

    return {
        title: $('.site-title').text(),
        link: url,
        description: $('[name=description]').attr('content'),
        item: out,
    };
}
