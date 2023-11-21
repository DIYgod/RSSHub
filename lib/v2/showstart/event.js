const qs = require('query-string');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.showstart.com';

module.exports = async (ctx) => {
    const cityCode = ctx.params.cityCode || '';
    const showStyle = ctx.params.showStyle || '';
    const keyword = ctx.params.keyword || '';

    const url = `${host}/event/list?${qs.stringify(
        {
            pageNo: 1,
            pageSize: 30,
            cityCode,
            showStyle,
            keyword,
        },
        {
            skipEmptyString: true,
        }
    )}`;

    const respond = await got.get(url);
    const $ = cheerio.load(respond.data);

    const city = $('.select-tag').first().find('.tag.active').text();
    const items = $('.list-box .show-item')
        .toArray()
        .map((item) => ({
            title: $(item).find('.title').text(),
            link: host + $(item).attr('href'),
            description: $(item).find('.addr').text(),
        }));

    ctx.state.data = {
        title: `秀动网 - ${city}`,
        link: host,
        item: items,
    };
};
