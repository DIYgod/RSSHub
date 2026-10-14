import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://antibody-software.com';
const parsePublicationDate = (value: string | number | undefined, format?: string) => {
    if (isOneOf(value, [undefined, null]) || value === '') {
        return;
    }
    const date = parseDate(value, format);
    return Number.isFinite(date.getTime()) ? date : undefined;
};
export const route: Route = {
    path: '/updates',
    categories: ['program-update'],
    example: '/wizfile/updates',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['antibody-software.com/wizfile/download'],
        },
    ],
    name: 'Version History',
    maintainers: ['Fatpandac'],
    handler,
    url: 'antibody-software.com/wizfile/download',
};
async function handler() {
    const currentUrl = `${rootUrl}/wizfile/download`;
    const response = await got(currentUrl);
    const $ = load(response.data);
    const items = $('section.blog-section > div > div > div > h4')
        .toArray()
        .map((item) => {
            const title = $(item)
                .text()
                .replace(/\(.*?\)/, '');
            const pubDate = parsePublicationDate(
                $(item)
                    .find('span')
                    .text()
                    .match(/\((.*?)\)/)?.[1]
            );
            const description = $(item).next().html();
            return {
                title,
                description,
                pubDate,
                guid: `${currentUrl}${title}`,
            };
        });
    return {
        title: 'WizFile - 更新日志',
        link: currentUrl,
        item: items,
    };
}

function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
