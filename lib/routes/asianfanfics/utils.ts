import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export async function getStories(url: string) {
    const headers = { 'user-agent': config.trueUA };
    const response = await ofetch.raw(url, { headers });
    const $ = load(response._data);
    const fragmentUrl = $('[hx-get]')
        .toArray()
        .map((element) => $(element).attr('hx-get'))
        .find((target) => target?.startsWith('/htmx/browse/') && target.includes('mount=1'));
    let fragment = $;
    if (fragmentUrl) {
        const fragmentResponse = await ofetch(new URL(fragmentUrl, response.url).href, { headers });
        fragment = load(fragmentResponse);
    }
    const item: DataItem[] = fragment('article')
        .toArray()
        .map((element) => {
            const article = fragment(element);
            const link = article.find('h3 a[href^="/story/view/"]');
            return {
                title: link.text(),
                link: new URL(link.attr('href')!, response.url).href,
                author: article.find('a[href^="/profile/u/"]').text(),
                updated: parseDate(article.find('time').attr('datetime')!),
                description: article.find('p.line-clamp-2').html(),
                category: article
                    .find('a[href^="/browse/tag/"]')
                    .toArray()
                    .map((tag) => fragment(tag).text()),
            };
        });

    return { link: response.url, item };
}
