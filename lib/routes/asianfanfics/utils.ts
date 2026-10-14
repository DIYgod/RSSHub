import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export async function getStories(url: string) {
    const headers = { 'user-agent': config.trueUA };
    const response = await ofetch.raw(url, { headers, responseType: 'text' });
    const $ = load(response._data!);
    const fragmentUrl = $('[hx-get]')
        .toArray()
        .map((element) => $(element).attr('hx-get'))
        .find((target) => target?.startsWith('/htmx/browse/') && target.includes('mount=1'));
    let fragment = $;
    if (fragmentUrl) {
        const fragmentResponse = await ofetch(new URL(fragmentUrl, response.url).href, { headers, responseType: 'text' });
        fragment = load(fragmentResponse);
    }
    const seen = new Set<string>();
    const item: DataItem[] = fragment('article')
        .toArray()
        .filter((element) => {
            const href = fragment(element).find('h3 a[href^="/story/view/"]').attr('href');
            if (!href || seen.has(href)) {
                return false;
            }
            seen.add(href);
            return true;
        })
        .map((element) => {
            const article = fragment(element);
            const link = article.find('h3 a[href^="/story/view/"]');
            const updated = article.find('time').attr('datetime');
            return {
                title: link.text(),
                link: new URL(link.attr('href')!, response.url).href,
                author: article.find('a[href^="/profile/u/"]').text(),
                updated: updated ? parseDate(updated) : undefined,
                description: article.find('p.line-clamp-2').html(),
                category: article
                    .find('a[href^="/browse/tag/"]')
                    .toArray()
                    .map((tag) => fragment(tag).text()),
            };
        });

    return { link: response.url, item };
}
