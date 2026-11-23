import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import { evaluateScriptData } from '@/utils/evaluate-script';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

import { parseToken } from './cookies';

const baseUrl = 'https://www.xueqiu.com';

export const route: Route = {
    path: '/column/:id',
    categories: ['finance'],
    example: '/xueqiu/column/9962554712',
    parameters: { id: '用户 id, 可在用户主页 URL 中找到' },
    features: {
        requireConfig: [{ name: 'XUEQIU_COOKIES', optional: true, description: '需要登录才能访问的专栏请配置雪球登录 Cookie。' }],
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
    const pageUrl = `${baseUrl}/${encodeURIComponent(id)}/column`;

    const cookie = config.xueqiu.cookies || (await parseToken());
    const headers = { Cookie: cookie, Referer: pageUrl };

    const pageData = await got(pageUrl, {
        headers,
    });
    const $ = load(pageData.data);
    const script = $('script')
        .toArray()
        .map((element) => $(element).text())
        .filter((source) => source.includes('SNOWMAN_TARGET'))
        .join('\n');
    if (!script) {
        throw new Error('The Xueqiu column page does not expose its profile. Verify the user ID and refresh XUEQIU_COOKIES from an account that can view the column.');
    }
    const snowmanTarget = await evaluateScriptData<{ screen_name: string; description: string }>(script, 'SNOWMAN_TARGET');
    if (!snowmanTarget?.screen_name) {
        throw new Error('The Xueqiu column profile is unavailable. Verify the user ID and refresh XUEQIU_COOKIES.');
    }

    const { data } = await got(`https://api.xueqiu.com/statuses/original/timeline.json?${new URLSearchParams({ user_id: id, page: '1' })}`, { headers });

    if (!Array.isArray(data?.list)) {
        throw new TypeError('The Xueqiu column API did not return a timeline. Refresh XUEQIU_COOKIES and verify access to the column on Xueqiu.');
    }
    if (!data.list.length && data.total > 0) {
        throw new Error('The Xueqiu column API hides its posts from this session. Set valid XUEQIU_COOKIES from an account that can view the column.');
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
