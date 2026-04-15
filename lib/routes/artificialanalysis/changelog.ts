import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://artificialanalysis.ai';
const targetUrl = `${baseUrl}/changelog`;

export const route: Route = {
    path: '/changelog',
    categories: ['program-update'],
    example: '/artificialanalysis/changelog',
    name: 'Changelog',
    maintainers: ['goestav'],
    handler,
    radar: [
        {
            source: ['artificialanalysis.ai/changelog'],
            target: '/changelog',
        },
    ],
    url: 'artificialanalysis.ai/changelog',
};

async function handler() {
    const item = await cache.tryGet(targetUrl, async () => {
        const response = await ofetch(targetUrl);
        const $ = load(response);
        const items: DataItem[] = [];

        const headings = $('h2')
            .toArray()
            .filter((heading) => /\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4}/.test($(heading).text().trim()));

        for (const heading of headings) {
            const date = $(heading).text().trim();
            let sibling = $(heading).next();
            let index = 0;
            while (sibling.length && !sibling.is('h2')) {
                sibling.find('a[href]').each((_, link) => {
                    const $link = $(link);
                    const title = $link.find('h3').text().trim() || $link.text().trim().replaceAll(/\s+/g, ' ');
                    const subtitle = $link.find('span').last().text().trim();
                    if (title) {
                        items.push({
                            title,
                            description: subtitle ? `<p>${subtitle}</p>` : undefined,
                            pubDate: parseDate(date),
                            link: new URL($link.attr('href') ?? '', baseUrl).href,
                            guid: `artificialanalysis-${date}-${index}`,
                        });
                        index += 1;
                    }
                });
                sibling = sibling.next();
            }
        }

        return items.filter((entry, index, list) => list.findIndex((other) => other.link === entry.link && other.title === entry.title) === index);
    });

    return {
        title: 'Artificial Analysis Changelog',
        description: 'Changelog and update stream from Artificial Analysis',
        link: targetUrl,
        item,
    };
}
