import { load } from 'cheerio';
import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/yilia/:url',
    categories: ['blog'],
    example: '/hexo/yilia/joeybling.github.io',
    parameters: { url: 'the blog URL without the protocol (http:// and https://)' },
    name: 'Blog using Yilia theme',
    maintainers: ['aha2mao'],
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
    const res = await ofetch(url);
    const $ = load(res);
    const authorInfo = $('.left-col').find('#header');

    const articles = $('article')
        .toArray()
        .map((article) => {
            const each = $(article);
            const titleEl = each.find('.article-title');

            return {
                title: titleEl.text(),
                link: encodeURI(`${url}${titleEl.attr('href')}`),
                description: each.find('.article-entry').text(),
                pubDate: each.find('time').attr('datetime'),
            };
        });

    return {
        title: authorInfo.find('.header-author').text(),
        link: url,
        description: authorInfo.find('.header-subtitle').text(),
        item: articles,
    };
}
