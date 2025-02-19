import { Route, Data } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    path: '/:userid',
    categories: ['blog'],
    example: '/youmemark/Cds2gZ2HIDdS41IfC6kzE1DL9Su1MqUp',
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

    // Extract user info from the profile section
    const name = $('h2.font-bold').text().trim();
    const avatar = $('span.relative.flex img').attr('src');
    const intro = $('.text-sm p').text().trim();

    // Extract bookmarks from the bookmarks section
    const items: Data['item'] = [];
    $('div.flex.flex-col.gap-2').each((_, element) => {
        const $item = $(element);
        const $divs = $item.children('div');
        if ($divs.length < 2) {
            return;
        }

        const $firstDiv = $divs.eq(0);
        const $link = $firstDiv.find('a').first();
        const $domain = $firstDiv.find('span').first();

        // Check for blockquote content
        let content = '';
        if ($divs.length >= 3) {
            const $contentDiv = $divs.eq(1);
            const $blockquote = $contentDiv.find('blockquote');
            if ($blockquote.length) {
                content = $blockquote.text().trim();
            }
        }

        const $dateDiv = $divs.eq(-1);

        if (!$link.length || !$dateDiv.length) {
            return;
        }

        const link = $link.attr('href');
        const title = $link.text().trim();
        const domain = $domain.text().trim().replaceAll(/[()]/g, '');
        const dateStr = $dateDiv.text().trim();

        if (link && title && dateStr) {
            const description = content || `${title} (${domain})`;

            items.push({
                title,
                link,
                description,
                pubDate: parseDate(dateStr, 'YYYY-MM-DD HH:mm'),
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
