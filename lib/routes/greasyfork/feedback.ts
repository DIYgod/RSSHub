import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/scripts/:script/feedback',
    categories: ['program-update'],
    example: '/greasyfork/scripts/431691-bypass-all-shortlinks/feedback',
    parameters: { script: 'Script id, can be found in URL' },
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
            source: ['greasyfork.org/:language/scripts/:script/feedback'],
        },
    ],
    name: 'Script Feedback',
    maintainers: ['miles170'],
    handler,
};

async function handler(ctx) {
    const script = ctx.req.param('script');
    const rootUrl = 'https://greasyfork.org';
    const currentUrl = `${rootUrl}/scripts/${script}/feedback`;
    const response = await got(currentUrl);
    const $ = load(response.data);

    return {
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name=description]').attr('content'),
        item: $('.script-discussion-list .discussion-list-container .discussion-list-item')
            .toArray()
            .map((item) => {
                item = $(item);
                const metaItem = item.find('.discussion-meta .discussion-meta-item').eq(0);
                const discussionTitle = item.find('.discussion-title');

                return {
                    title: discussionTitle.text().trim(),
                    author: metaItem.find('a').text(),
                    pubDate: parseDate(metaItem.find('gf-relative-time').attr('datetime')),
                    link: rootUrl + discussionTitle.attr('href'),
                };
            }),
    };
}
