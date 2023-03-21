const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://yz.chsi.com.cn';

module.exports = async (ctx) => {
    const response = await got(host);
    const $ = cheerio.load(response.data);
    const list = $('.focus-part .index-hot a');
    const items = await Promise.all(
        list.map((i, item) => {
            const { href: path, title: itemTitle } = item.attribs;
            let itemUrl = '';
            if (!path.startsWith('https://') && !path.startsWith('http://')) {
                itemUrl = host + path;
            } else {
                itemUrl = path;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = '';
                if (!path.startsWith('https://') && !path.startsWith('http://')) {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('#article_dnull').html()) {
                        description = $('#article_dnull').html().trim();
                    } else {
                        description = itemTitle;
                    }
                } else {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    description,
                };
            });
        })
    );

    ctx.state.data = {
        title: `中国研究生招生信息网 - 热点`,
        link: String(host),
        description: '中国研究生招生信息网 - 热点',
        item: items,
    };
};
