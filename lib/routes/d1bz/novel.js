const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

function changeStr(str, index, changeStr) {
    return str.substr(0, index) + changeStr + str.substr(index + changeStr.length);
}

function find(str, cha, num) {
    let x = str.indexOf(cha);
    for (let i = 0; i < num; i++) {
        x = str.indexOf(cha, x + 1);
    }
    return x;
}

module.exports = async (ctx) => {
    const category = ctx.params.category.toLowerCase();
    const id = ctx.params.id.toLowerCase();
    const baseUrl = 'http://www.dybz9.net';
    const novelUrl = `${baseUrl}/${category}/${id}/`;

    const response = await got({
        method: 'get',
        url: novelUrl,
        headers: {
            'Content-Type': 'application/xhtml+xml; charset=gbk',
        },
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));
    const lists = $('.container .chapter-list .bd ul li').slice(0, 3);
    const chapter_item = lists
        .find('a')
        .map((_, e) => ({
            title: e.children[0].data,
            link: baseUrl + e.attribs.href,
        }))
        .get();

    // 章节内容
    const items = await Promise.all(
        chapter_item.map(async (item) => {
            // 页面缓存
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            // 获取分页内容
            const firstUrl = item.link;

            /* eslint-disable no-await-in-loop */
            /* eslint-disable no-var */
            /* eslint-disable block-scoped-var */
            let i = 0;
            while (i <= 5) {
                const pos = find(firstUrl, '.', 2);
                const childStr = '_' + i + '.html';
                const ll = changeStr(firstUrl, pos, childStr);

                const response = await got({
                    method: 'get',
                    url: ll,
                    responseType: 'buffer',
                });
                // console.log(ll);

                const responseHtml = iconv.decode(response.data, 'GBK');
                const $ = cheerio.load(responseHtml);

                const description = $('.page-content').html();
                const contents = description + ',';
                // console.log(contents);
                var single = {
                    title: item.title,
                    description: contents,
                    link: item.link,
                };
                i++;
            }
            /* eslint-enable no-await-in-loop */
            /* eslint-disable no-var */
            /* eslint-disable block-scoped-var */

            ctx.cache.set(item.link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '',
        link: novelUrl,
        item: items,
    };
};
