import { load } from 'cheerio';
import { escapeText } from 'entities';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const INSTANCES = new Map([
    ['apache', 'bz.apache.org/bugzilla'],
    ['apache.ooo', 'bz.apache.org/ooo'], // Apache OpenOffice
    ['apache.SpamAssassin', 'bz.apache.org/SpamAssassin'],
    ['kernel', 'bugzilla.kernel.org'],
    ['mozilla', 'bugzilla.mozilla.org'],
    ['webkit', 'bugs.webkit.org'],
]);

async function handler(ctx: Context): Promise<Data> {
    const { site, bugId } = ctx.req.param();
    if (!INSTANCES.has(site)) {
        throw new InvalidParameterError(`unknown site: ${site}`);
    }
    const link = `https://${INSTANCES.get(site)}/show_bug.cgi?id=${bugId}`;
    const xml = await ofetch(`${link}&ctype=xml`);
    const $ = load(xml, { xmlMode: true });
    const items = $('long_desc')
        .toArray()
        .map((rawItem, index) => {
            const $item = $(rawItem);
            return {
                title: `comment #${$item.find('commentid').text()}`,
                link: `${link}#c${index}`,
                description: `<pre>${escapeText($item.find('thetext').text())}</pre>`,
                pubDate: parseDate($item.find('bug_when').text()),
                author: $item.find('who').attr('name'),
            };
        });
    return { title: $('short_desc').text(), link, item: items };
}

function markdownFrom(separator: string = ', '): string {
    return [...INSTANCES].map(([k, v]) => `[\`${k}\`](https://${v})`).join(separator);
}

export const route: Route = {
    path: '/bug/:site/:bugId',
    name: 'bugs',
    maintainers: ['FranklinYu'],
    handler,
    example: '/bugzilla/bug/webkit/251528',
    parameters: {
        site: 'site identifier',
        bugId: 'numeric identifier of the bug in the site',
    },
    description: `Supported site identifiers: ${markdownFrom()}.`,
    categories: ['programming'],

    // Radar is infeasible, because it needs access to URL parameters.
    zh: {
        name: 'bugs',
        description: `支持的站点标识符：${markdownFrom('、')}。`,
    },
};
