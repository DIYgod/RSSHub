const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yzxc.ustb.edu.cn';
const url = `${host}/tzgg/index.htm`;

module.exports = async (ctx) => {
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('.page_content .ul-inline .box');
    const items = await Promise.all(
        list.map((i, item) => {
            const $item = $(item);
            const time = $item.find('.time').text();
            const titleDom = $item.find('.title a');
            const titleText = titleDom.text();
            const path = titleDom.last().attr('href');
            let itemUrl = '';
            if (path.startsWith('http')) {
                itemUrl = path;
            } else if (path.startsWith('..')) {
                itemUrl = path.replace(/\.\./g, host);
            } else {
                itemUrl = host + path;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = titleText;
                const result = await got(itemUrl);
                const $ = cheerio.load(result.data);
                if ($('.article') && $('.article').html()) {
                    description = $('.article').html().trim();
                }
                return {
                    title: titleText,
                    link: itemUrl,
                    pubDate: parseDate(time),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: '北京科技大学研究生招生信息网 - 通知公告',
        link: url,
        description: '北京科技大学研究生招生信息网 - 通知公告',
        item: items,
    };
};
