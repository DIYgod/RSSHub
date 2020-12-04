const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.nintendo.co.jp/support/switch/system_update/index.html';

    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const list = $('#latest > .c-heading-lv3').toArray().slice(1);

    ctx.state.data = {
        title: 'Nintendo Switch 本体更新情報',
        link: url,
        item: list.map((update) => {
            update = $(update);
            const heading = update.text();
            const matched_date = /(\d+)年(\d+)月(\d+)日/.exec(heading);
            const update_info = update.nextUntil('.c-heading-lv3');
            const update_infos = update_info
                .map(function () {
                    return $(this).html();
                })
                .get()
                .join('\n');
            const matched_version = /(\d\.)+\d/.exec(heading);

            return {
                title: heading,
                author: 'Nintendo',
                description: update_infos,
                link: url,
                guid: `${url}#${matched_version[0]}`,
                pubDate: new Date(parseInt(matched_date[1]), parseInt(matched_date[2]) - 1, parseInt(matched_date[3])),
            };
        }),
    };
};
