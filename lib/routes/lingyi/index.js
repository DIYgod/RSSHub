const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const categories = {
        tuijian: '编辑推荐',
        lingyishijian: '灵异事件',
        guihualianpian: '鬼话连篇',
        minjianqitan: '民间奇谈',
        qiwenyishi: '奇闻异事',
        lingyitupian: '灵异图片',
    };
    const url = `http://www.lingyi.org/topics/${ctx.params.category}`;
    const res = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(res.data);
    const resultItem = $('.post-list-item')
        .map((index, li) => {
            const elem = $(li);
            return {
                title: elem.find('h2').text(),
                description: elem.find('.post-excerpt').text(),
                link: elem.find('h2 a').attr('href'),
                image: elem.find('.mobile-show > div > a > picture > img').attr('href'),
                pubDate: elem.find('time').attr('datetime'),
                author: elem.find('.post-list-meta-user>a>span').text(),
            };
        })
        .get();

    const out = await Promise.all(
        resultItem.map(async (link) => {
            const pageUrl = link.link;
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await got({
                method: 'get',
                url: pageUrl,
                headers: {
                    Referer: url,
                },
            });
            const $1 = cheerio.load(response.data);
            const single = {
                pubDate: link.pubDate,
                link: link.link,
                title: link.title,
                description: $1('.entry-content').html(),
            };
            ctx.cache.set(link.link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${categories[ctx.params.category]} - 中国灵异网`,
        link: url,
        item: out,
    };
};
