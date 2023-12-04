const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://gs.sass.org.cn';
module.exports = async (ctx) => {
    const type = ctx.params.type;
    const url = `${host}/${type}/list.htm`;

    const response = await got(url);

    const $ = cheerio.load(response.data);
    const list = $('.column-news-list .cols_list .cols');
    const items = await Promise.all(
        list.map((i, item) => {
            const [titleLink, time] = item.children;
            const itemDate = $(time).text();
            const { href: path, title: itemTitle } = titleLink.children[0].attribs;

            let itemUrl = '';
            if (path.startsWith('http')) {
                itemUrl = path;
            } else {
                itemUrl = host + path;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = '';
                if (itemUrl) {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('.read .wp_articlecontent').length) {
                        description = $('.read .wp_articlecontent').html().trim();
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
                    pubDate: parseDate(itemDate, 'YYYY-MM-DD'),
                };
            });
        })
    );
    // 处理返回
    ctx.state.data = {
        title: '上海社会科学院 - 研究生院',
        link: url,
        description: '上海社会科学院 - 研究生院',
        item: items,
    };
};
