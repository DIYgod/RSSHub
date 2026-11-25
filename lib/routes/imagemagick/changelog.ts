import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import MarkdownIt from '@/utils/markdown-it';
import { parseDate } from '@/utils/time';

const md = MarkdownIt({
    html: true,
});

export const route: Route = {
    path: '/changelog',
    categories: ['program-update'],
    example: '/imagemagick/changelog',
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
            source: ['imagemagick.org/download', 'imagemagick.org/changelog', 'imagemagick.org/script/download.php', 'imagemagick.org/script', 'imagemagick.org/'],
        },
    ],
    name: 'Changelog',
    maintainers: ['nczitzk'],
    handler,
    url: 'imagemagick.org/download',
};

async function handler() {
    const rootUrl = 'https://imagemagick.org';
    const currentUrl = `${rootUrl}/download/`;
    const logUrl = 'https://github.com/ImageMagick/Website/blob/main/docs/changelog/index.md';
    const rawLogUrl = 'https://raw.githubusercontent.com/ImageMagick/Website/main/docs/changelog/index.md';

    const response = await got({
        method: 'get',
        url: rawLogUrl,
    });

    const $ = load(md.render(response.data));

    const items = $('h2')
        .toArray()
        .map((item) => {
            const $item = $(item);

            const title = $item.text();

            let description = '';
            $item.nextUntil('h2').each((_, el) => {
                description += $(el).prop('outerHTML');
            });

            return {
                title,
                description,
                link: `${logUrl}#${title.replaceAll(/\s+/g, '-').replaceAll('.', '')}`,
                pubDate: parseDate(`${title.match(/- (\d{4}-\d{2}-\d{2})/)![1]}T00:00:00Z`),
            };
        });

    return {
        title: 'ImageMagick - ChangeLog',
        link: currentUrl,
        item: items,
    };
}
