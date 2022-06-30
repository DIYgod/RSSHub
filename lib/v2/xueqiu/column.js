const got = require('@/utils/got');
const { JSDOM } = require('jsdom');
const { CookieJar } = require('tough-cookie');
const { parseDate } = require('@/utils/parse-date');
const cookieJar = new CookieJar();
const baseUrl = 'https://xueqiu.com';

module.exports = async (ctx) => {
    const { id } = ctx.params;
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

    ctx.state.data = {
        title: `${SNOWMAN_TARGET.screen_name} - 雪球`,
        link: pageUrl,
        description: SNOWMAN_TARGET.description,
        item: items,
    };
};
