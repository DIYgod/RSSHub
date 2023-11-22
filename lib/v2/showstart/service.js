const qs = require('query-string');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.showstart.com';

async function fetchShowRSS({ keyword, showStyle, cityCode }) {
    const url = `${host}/event/list?${qs.stringify(
        {
            pageNo: 1,
            pageSize: 30,
            cityCode: cityCode || '',
            showStyle: showStyle || '',
            keyword: keyword || '',
        },
        {
            skipEmptyString: true,
        }
    )}`;

    const respond = await got.get(url);
    const $ = cheerio.load(respond.data);

    const tags = $('.tools-bar .tag')
        .toArray()
        .map((item) => $(item).text())
        .join(' - ');

    const items = $('.list-box .show-item')
        .toArray()
        .map((item) => ({
            title: $(item).find('.title').text(),
            link: host + $(item).attr('href'),
            description: $(item).find('.addr').text(),
        }));

    return {
        title: `秀动网 - ${tags}`,
        link: host,
        item: items,
    };
}

module.exports = {
    fetchShowRSS,
};
