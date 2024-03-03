// @ts-nocheck
import got from '@/utils/got';
const { JSDOM } = require('jsdom');
const { CookieJar } = require('tough-cookie');
import { parseDate } from '@/utils/parse-date';
const cookieJar = new CookieJar();
const baseUrl = 'https://xueqiu.com';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const pageUrl = `${baseUrl}/${id}/column`;

    const pageData = await got(pageUrl, {
        cookieJar,
    });
    const { window } = new JSDOM(pageData.data, {
        runScripts: 'dangerously',
    });
    const SNOWMAN_TARGET = window.SNOWMAN_TARGET;

    const { data } = await got(`${baseUrl}/statuses/original/timeline.json`, {
        cookieJar,
        searchParams: {
            user_id: id,
            page: 1,
        },
    });

    const items = data.list.map((item) => ({
        title: item.title,
        description: item.description,
        pubDate: parseDate(item.created_at, 'x'),
        link: `${baseUrl}${item.target}`,
        author: SNOWMAN_TARGET.screen_name,
    }));

    ctx.set('data', {
        title: `${SNOWMAN_TARGET.screen_name} - 雪球`,
        link: pageUrl,
        description: SNOWMAN_TARGET.description,
        item: items,
    });
};
