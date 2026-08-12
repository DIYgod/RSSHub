import { load } from 'cheerio';
import type { Context } from 'hono';
import sanitizeHtml from 'sanitize-html';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/:username',
    categories: ['social-media'],
    example: '/gab/user/AmericanFamAssc',
    parameters: { username: 'Username' },
    name: "User's Posts",
    maintainers: ['zphw'],
    handler,
};

async function handler(ctx: Context) {
    const { username } = ctx.req.param();

    const account = await cache.tryGet(`gab:user:${username}`, () => ofetch(`https://gab.com/api/v1/account_by_username/${username}`));
    const gabs = await ofetch(`https://gab.com/api/v2/accounts/${account.id}/statuses?sort_by=no-reposts`);

    const results = gabs.s.map((item) => {
        const media = (item.mai ?? [])
            .map((id) => gabs.ma.find((attachment) => attachment.i === id))
            .filter(Boolean)
            .map((attachment) => (attachment.t === 'video' ? `<video src="${attachment.smp4}" poster="${attachment.pu}" controls></video>` : `<img src="${attachment.u ?? attachment.pu}">`))
            .join('<br>');
        const $ = load(item.c);

        return {
            title: $.root().text() || 'Untitled',
            description: item.c + (media && '<br>' + media),
            link: item.ul || `https://gab.com/${username}`,
            pubDate: parseDate(item.ca),
            author: gabs.a.find((author) => author.i === item.ai)?.dn,
        };
    });

    return {
        title: `Gab - ${account.display_name}`,
        description: sanitizeHtml(account.note, { allowedTags: [], allowedAttributes: {} }),
        link: `https://gab.com/${username}`,
        image: account.avatar,
        item: results,
    };
}
