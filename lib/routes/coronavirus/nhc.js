const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://www.nhc.gov.cn/xcs/yqtb/list_gzbd.shtml`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.zxxx_list a');
    ctx.state.data = {
        title: '疫情通报-国家卫健委',
        link: url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const title = item.text();
                    const address = item.attr('href');
                    const host = `http://www.nhc.gov.cn/`;
                    return {
                        title,
                        description: title,
                        link: host + address,
                        guid: host + address,
                    };
                })
                .get(),
    };
};
