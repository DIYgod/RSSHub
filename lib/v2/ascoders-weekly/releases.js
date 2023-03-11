const got = require('@/utils/got');
const config = require('@/config').value;
const queryString = require('query-string');
const { parseDate } = require('@/utils/parse-date');
const md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true,
});

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? (parseInt(ctx.query.limit) > 100 ? 100 : parseInt(ctx.query.limit)) : 5;

    const fulltext = ctx.query.mode && ctx.query.mode === 'fulltext';

    const headers = { Accept: 'application/vnd.github.v3+json' };
    if (config.github && config.github.access_token) {
        headers.Authorization = `token ${config.github.access_token}`;
    }

    const response = await got({
        method: 'get',
        url: 'https://api.github.com/repos/ascoders/weekly/releases',
        searchParams: queryString.stringify({
            per_page: limit,
        }),
        headers,
    });
    const data = response.data;

    // reset accept for request markdown
    headers.Accept = undefined;

    const items = data.map(async (item) => {
        if (!fulltext) {
            return [
                {
                    title: `${item.tag_name}. ${item.name}`,
                    author: item.author.login,
                    description: item.body,
                    pubDate: parseDate(item.published_at),
                    link: item.html_url,
                },
            ];
        }

        const items = await Promise.allSettled(
            item.body
                .match(/\bhttps?:\/\/\S+\b/gi) // find url in html a ref
                .map((u) => u.replace('https://github.com/ascoders/weekly/blob/master', `https://raw.githubusercontent.com/ascoders/weekly/${item.tag_name}`)) // get markdown raw content
                .map(async (url) => {
                    // parse markdown to html
                    const description = await ctx.cache.tryGet(url, async () => {
                        const response = await got.get({
                            method: 'get',
                            url,
                            headers,
                        });
                        return response.data ? md.render(response.data) : `No description for ${item.name}`;
                    });

                    return {
                        title: `${item.tag_name}. ${item.name}`,
                        author: item.author.login,
                        description,
                        pubDate: parseDate(item.published_at),
                        link: url,
                    };
                })
        ).then((res) => res.filter((e) => e.status === 'fulfilled').map((e) => e.value));
        return items;
    });

    const item = await Promise.allSettled(items).then((res) =>
        res
            .filter((e) => e.status === 'fulfilled')
            .map((e) => e.value)
            .flat()
    );
    ctx.state.data = {
        title: 'ascoders/weekly - 前端精读周刊',
        link: 'https://github.com/ascoders/weekly/releases',
        description: '前端精读周刊。帮你理解最前沿、实用的技术。前端界的好文精读，每周更新！',
        item,
    };
};
