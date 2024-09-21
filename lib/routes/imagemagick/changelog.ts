import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import MarkdownIt from 'markdown-it';
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
            source: ['imagemagick.org/script/download.php', 'imagemagick.org/script', 'imagemagick.org/'],
        },
    ],
    name: 'Changelog',
    maintainers: ['nczitzk'],
    handler,
    url: 'imagemagick.org/script/download.php',
};

async function handler() {
    const rootUrl = 'https://imagemagick.org';
    const currentUrl = `${rootUrl}/script/download.php`;
    const logUrl = 'https://github.com/ImageMagick/Website/blob/main/ChangeLog.md';
    const rawLogUrl = 'https://raw.githubusercontent.com/ImageMagick/Website/main/ChangeLog.md';

    const response = await got({
        method: 'get',
        url: rawLogUrl,
    });

    const $ = load(md.render(response.data));

    const items = $('h2')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.text();

            let description = '';
            item.nextUntil('h2').each(function () {
                description += $(this).html();
            });

            return {
                title,
                description,
                link: `${logUrl}#${title.replaceAll(/\s+/g, '-').replaceAll('.', '')}`,
                pubDate: parseDate(title.match(/- (\d{4}-\d{2}-\d{2})/)[1]),
            };
        });

    return {
        title: 'ImageMagick - ChangeLog',
        link: currentUrl,
        item: items,
    };
}
