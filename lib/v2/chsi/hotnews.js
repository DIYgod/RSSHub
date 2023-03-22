const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.chsi.com.cn';

module.exports = async (ctx) => {
    const response = await got(host);
    const $ = cheerio.load(response.data);
    const list = $('.focus-part .index-hot a');
    const items = await Promise.all(
        list.map((i, item) => {
            const { href: path, title: itemTitle } = item.attribs;
            let itemUrl = '';
            if (path.startsWith('http')) {
                itemUrl = path;
            } else {
                itemUrl = host + path;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = '';
                let itemDate = undefined;
                if (path) {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('#article_dnull').html()) {
                        description = $('#article_dnull').html().trim();
                    } else {
                        description = itemTitle;
                    }
                    if ($('.news-time').text()) {
                        itemDate = $('.news-time').text();
                    }
                } else {
                    description = itemTitle;
                }
                const result = {
                    title: itemTitle,
                    link: itemUrl,
                    description,
                };
                if (itemDate) {
                    result.pubDate = parseDate(itemDate, 'YYYY年MM月DD日');
                }
                return result;
            });
        })
    );

    ctx.state.data = {
        title: `中国研究生招生信息网 - 热点`,
        link: host,
        description: '中国研究生招生信息网 - 热点',
        item: items,
    };
};
