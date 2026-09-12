import { load } from 'cheerio';
import { CookieJar } from 'tough-cookie';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { parseScriptData } from '@/utils/parse-script-data';

const cookieJar = new CookieJar();
const baseUrl = 'https://xueqiu.com';

export const route: Route = {
    path: '/column/:id',
    categories: ['finance'],
    example: '/xueqiu/column/9962554712',
    parameters: { id: '用户 id, 可在用户主页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xueqiu.com/:id/column'],
        },
    ],
    name: '用户专栏',
    maintainers: ['TonyRL', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const pageUrl = `${baseUrl}/${id}/column`;

    // Get cookie first
    await got(baseUrl, {
        cookieJar,
    });

    const pageData = await got(pageUrl, {
        cookieJar,
    });
    const $ = load(pageData.data);
    const script = $('script')
        .toArray()
        .map((element) => $(element).text())
        .filter((source) => source.includes('SNOWMAN_TARGET'))
        .join('\n');
    const snowmanTarget = parseScriptData<{ screen_name: string; description: string }>(script, 'SNOWMAN_TARGET');

    const { data } = await got(`${baseUrl}/statuses/original/timeline.json`, {
        cookieJar,
        searchParams: {
            user_id: id,
            page: 1,
        },
    });

    if (!data.list) {
        throw new Error('Error occurred, please refresh the page or try again after logging back into your account');
    }

    const items = data.list.map((item) => ({
        title: item.title,
        description: item.description,
        pubDate: parseDate(item.created_at, 'x'),
        link: `${baseUrl}${item.target}`,
        author: snowmanTarget.screen_name,
    }));

    return {
        title: `${snowmanTarget.screen_name} - 雪球`,
        link: pageUrl,
        description: snowmanTarget.description,
        item: items,
    };
}
