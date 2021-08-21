const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const url = `https://www.cyzone.cn/author/${id}`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    const list = $('.article-item');

    const out = await Promise.all(
        list
            .map(async (index, elem) => {
                const $elem = $(elem);
                const $title = $elem.find('.item-title');
                const link = 'https:' + $title.attr('href');
                const pubDate = new Date(+$elem.find('.time').attr('data-time') * 1000).toUTCString();
                const item = {
                    title: $title.text(),
                    pubDate,
                    link,
                };
                const key = `cyzone-${link}`;
                const value = await ctx.cache.get(key);
                if (value) {
                    item.description = value;
                } else {
                    const storyDetail = await got.get(item.link);
                    const data = storyDetail.data;
                    const $ = cheerio.load(data);
                    $('.article-content img').each(function () {
                        const $img = $(this);
                        const src = $img.attr('src');

                        if (!src.startsWith('http')) {
                            $img.attr('src', 'https:' + src);
                        }
                    });
                    item.description = $('.article-content').html();
                    ctx.cache.set(key, item.description);
                }

                return item;
            })
            .get()
    );

    ctx.state.data = {
        title: `创业邦-作者 ${$('.ss-title').text()}`,
        link: url,
        description: '创业邦致力于成为中国创业者的信息平台和服务平台，帮助中国创业者实现创业梦想。创业邦为创业者和风险投资人提供各种创业类最新资讯和实用知识手册，打造创业者和投资人的社交平台。',
        item: out,
    };
};
