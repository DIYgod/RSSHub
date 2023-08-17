const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const { parseDate } = require('@/utils/parse-date');
const { eecsMap } = require('./utils');

module.exports = async (ctx) => {
        const { type = 'jiaowu' } = ctx.params;
        const response = await got.get(eecsMap.get(type)[0]);
        const $ = cheerio.load(response.data);
        const list = $(eecsMap.get(type)[1])
            .map((index, ele) => ({
                title: $(ele).find(eecsMap.get(type)[2]).text(),
                pubDate: parseDate($(ele).find('span').text(), 'YYYY/MM/DD'),
                link: url.resolve(eecsMap.get(type)[0], $(ele).find(eecsMap.get(type)[2]).attr('href')),
            }))
            .get();

        const out = await Promise.all(
            list.map(async (item) => {
                const detail_response = await got.get(item.link);
                const $ = cheerio.load(detail_response.data);
                item.description = $(eecsMap.get(type)[3]).html();
                return item;
            })
        );

        ctx.state.data = {
            title: eecsMap.get(type)[4],
            link: eecsMap.get(type)[0],
            description: eecsMap.get(type)[4],
            item: out,
        };
    };

