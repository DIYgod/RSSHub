const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const response = await got.get(`http://dy.163.com/v2/article/list.do?pageNo=1&wemediaId=${id}&size=10`);
    const charset = response.headers['content-type'].split('=')[1];
    const list = response.data.data.list;
    let author, link;

    const items = await Promise.all(
        list.map(async (e) => {
            if (e.docid) {
                e.link = 'http://dy.163.com/v2/article/detail/' + e.docid + '.html';
            }

            author = e.source ? e.source : '';

            const html = await ctx.cache.tryGet(e.link, async () =>
                iconv.decode(
                    (
                        await got.get(e.link, {
                            responseType: 'buffer',
                        })
                    ).data,
                    charset
                )
            );
            const $ = cheerio.load(html, { decodeEntities: false });

            const article = $('.post_body');

            const single = {
                title: e.title,
                link: e.link,
                description: article.html(),
                pubDate: date(e.ptime, 8),
                author: e.source,
            };

            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `网易号 - ${author}`,
        link,
        description: '',
        item: items,
    };
};
