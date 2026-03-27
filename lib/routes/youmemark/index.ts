import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:userid',
    categories: ['blog'],
    example: '/youmemark/pseudoyu',
    parameters: { userid: '`userid` is the user id of youmemark' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Bookmarks',
    maintainers: ['pseudoyu'],
    handler,
    radar: [
        {
            source: ['youmemark.com/user/:userid'],
            target: '/:userid',
        },
    ],
    description: `Get user's public bookmarks from YouMeMark
::: tip
  Add \`?limit=<number>\` to the end of the route to limit the number of items. Default is 10.
:::`,
};

async function handler(ctx): Promise<Data> {
    const userid = ctx.req.param('userid');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10;

    const response = await ofetch(`https://youmemark.com/user/${userid}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
    });

    const $ = load(response);

    const name = $('h2.font-bold').text().trim();
    const avatar = $('span.relative.flex img, span.relative.flex.shrink-0 img').attr('src');
    const intro = $('.text-center .prose p, .text-sm.text-gray-500.text-center .prose p').first().text().trim();

    const items: Data['item'] = [];
    $('h2:contains("收集箱")')
        .parent()
        .find('.rounded-lg.space-y-2')
        .each((_, element) => {
            const $item = $(element);

            const $linkDiv = $item.find('> div').first();
            const $link = $linkDiv.find('a');
            const title = $link.find('span').first().text().trim();
            const domain = $link.find('span').last().text().trim().replaceAll(/[()]/g, '').trim();
            const link = $link.attr('href');

            const $contentDiv = $linkDiv.find('> div.text-sm.text-gray-500');
            const content = $contentDiv.find('p').text().trim();

            const dateStr = $item.find('.text-xs.text-gray-500 span').text().trim();

            if (link && title && dateStr) {
                items.push({
                    title,
                    link,
                    description: content,
                    pubDate: parseDate(dateStr, 'YYYY-MM-DD'),
                    author: domain,
                    guid: link,
                });
            }
        });

    return {
        title: `${name}'s Bookmarks - YouMeMark`,
        link: `https://youmemark.com/user/${userid}`,
        description: intro,
        image: avatar,
        item: items.slice(0, limit),
        language: 'en',
    } as Data;
}
