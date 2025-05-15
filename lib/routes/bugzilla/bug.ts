import { load } from 'cheerio';
import { Context } from 'hono';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { Data, DataItem, Route } from '@/types';
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
    const $ = load(await ofetch(`${link}&ctype=xml`));
    const items = $('long_desc').map((index, rawItem) => {
        const $ = load(rawItem, null, false);
        return {
            title: `comment #${$('commentid').text()}`,
            link: `${link}#c${index}`,
            description: $('thetext').text(),
            pubDate: parseDate($('bug_when').text()),
            author: $('who').attr('name'),
        } as DataItem;
    });
    return { title: $('short_desc').text(), link, item: items.toArray() };
}

function markdownFrom(instances: Map<string, string>, separator: string = ', '): string {
    return [...instances.entries()].map(([k, v]) => `[\`${k}\`](https://${v})`).join(separator);
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
    description: `Supported site identifiers: ${markdownFrom(INSTANCES)}.`,
    categories: ['programming'],

    // Radar is infeasible, because it needs access to URL parameters.
    zh: {
        name: 'bugs',
        description: `支持的站点标识符：${markdownFrom(INSTANCES, '、')}。`,
    },
};
