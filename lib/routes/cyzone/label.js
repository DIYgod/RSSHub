const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const url = `https://www.cyzone.cn/label/${encodeURIComponent(name)}/`;
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
                    item.description = $('.article-content').html() || '内容已删除或未通过审核';
                    ctx.cache.set(key, item.description);
                }

                return Promise.resolve(item);
            })
            .get()
    );

    ctx.state.data = {
        title: `创业邦-#${name}#`,
        link: url,
        item: out,
    };
};
