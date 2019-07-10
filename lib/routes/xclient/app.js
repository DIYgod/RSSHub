const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const name = ctx.params.name;

    const response = await got({
        method: 'get',
        url: `http://xclient.info/s/${name}.html`,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#versions tbody tr');

    ctx.state.data = {
        title: $('title').text(),
        link: `http://xclient.info/s/${name}.html`,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const td = item.find('td');
                    return {
                        title: td.eq(0).text(),
                        description: `版本号：${td.eq(0).text()}<br>更新日期：${td.eq(2).text()}<br>文件大小：${td.eq(3).text()}`,
                        pubDate: new Date(td.eq(2).text()).toUTCString(),
                        link: `http://xclient.info/s/${name}.html`,
                        guid: td.eq(0).text(),
                    };
                })
                .get(),
    };
};
