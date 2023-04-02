const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://yzb.cust.edu.cn';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/${type}/index.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const list = $('.list_b  .more');
    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemTitle = item.text();
        const itemPath = item.attr('href');
        const description = itemTitle;
        return {
            title: itemTitle,
            link: itemPath,
            description,
        };
    });
    ctx.state.data = {
        title: '长春理工大学研究生招生网',
        link: pageUrl,
        description: '长春理工大学研究生招生网',
        item: items,
    };
};
