const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const url = 'https://zw.cdzjryb.com/lottery/accept/projectList';
    const { data: response } = await got(url);
    const $ = cheerio.load(response);

    const list = $('#_projectInfo tr')
        .toArray()
        .map((item) =>
            $(item)
                .find('td')
                .toArray()
                .map((td) => $(td).text().trim())
        );

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(`cdzjryb:zw:projectList${item[0]}`, async () => {
                const { data: notice } = await got.post('https://zw.cdzjryb.com/lottery/accept/getProjectRule', {
                    form: {
                        projectUuid: item[0],
                    },
                });
                return {
                    title: item[3],
                    description: art(path.join(__dirname, 'templates/projectList.art'), {
                        item,
                        notice: notice.message,
                    }),
                    link: url,
                    guid: `cdzjryb:zw:projectList:${item[0]}`,
                    pubDate: timezone(parseDate(item[8]), 8),
                };
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link: url,
        item: items,
    };
};
