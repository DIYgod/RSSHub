const cheerio = require('cheerio');
const zlib = require('zlib');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { getAcwScV2ByArg1 } = require('./utils');

module.exports = async (ctx) => {
    const rootUrl = 'https://csgo.5eplay.com/';
    const apiUrl = `${rootUrl}api/article?page=1&type_id=0&time=0&order_by=0`;
    const articleUrl = `${rootUrl}article`;

    const { data: response } = await got({
        method: 'get',
        url: apiUrl,
    });

    const expiredTime = 25 * 60 * 1000;

    let acw_sc__v2 = '';
    // get arg1
    await ctx.cache.tryGet(
        articleUrl,
        async () => {
            // Zlib Z_BUF_ERROR, should close decompress
            const detailResponse = await got(
                {
                    method: 'get',
                    url: articleUrl,
                },
                {
                    decompress: false,
                }
            );

            const obj_unzip = zlib.createUnzip({
                chunkSize: 20 * 1024,
            });
            obj_unzip.write(detailResponse.body);
            const arg1 = await new Promise((resolve) => {
                obj_unzip.on('data', (data) => {
                    resolve(data.toString().match(/var arg1='(.*?)';/)[1]);
                });
            });
            acw_sc__v2 = getAcwScV2ByArg1(arg1);
        },
        expiredTime,
        false
    );

    const items = await Promise.all(
        response.data.list.map((item) =>
            ctx.cache.tryGet(item.jump_link, async () => {
                const { data: detailResponse } = await got({
                    method: 'get',
                    url: item.jump_link,
                    headers: {
                        cookie: `acw_sc__v2=${acw_sc__v2}`,
                    },
                });
                const $ = cheerio.load(detailResponse);

                const content = $('.article-text');
                const res = [];

                content.find('> p, > blockquote').each((i, e) => {
                    res.push($(e).text());
                    const src = $(e).find('img').first().attr('src');
                    if (src && !src.includes('data:image/png;base64')) {
                        // drop base64 img
                        res.push(`<img src=${src} />`);
                    }
                });

                return {
                    title: item.title,
                    description: res.join('<br />'),
                    pubDate: parseDate(item.dateline * 1000),
                    link: item.jump_link,
                };
            })
        )
    );

    ctx.state.data = {
        title: '5EPLAY',
        link: 'https://csgo.5eplay.com/article',
        item: items,
    };
};
