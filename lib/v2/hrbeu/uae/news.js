const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { finishArticleItem } = require('@/utils/wechat-mp');

module.exports = async (ctx) => {
    const id = ctx.params.id.replace(/-/g, '/');
    const host = 'http://uae.hrbeu.edu.cn';
    const url = `${host}/${id}.htm`;

    const response = await got(url, {
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const title = $('h2').text();
    const items = $('li.wow.fadeInUp')
        .map((_, item) => {
            const title = $(item).find('a').attr('title');
            let link = $(item).find('a').attr('href');
            if (!link.startsWith('http')) {
                link = `${host}/${link}`;
            }
            const pubDate = parseDate(
                $(item)
                    .find('div.date')
                    .text()
                    .replace(/(.*)\/(.*)/g, '$2-$1')
            );
            return {
                title,
                pubDate,
                link,
            };
        })
        .get();

    const item = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (new URL(item.link).hostname === 'uae.hrbeu.edu.cn') {
                    const resp = await got(item.link);
                    const $1 = cheerio.load(resp.data);
                    item.description = $1('div.art-body').html();
                } else if (new URL(item.link).hostname === 'news.hrbeu.edu.cn') {
                    const resp = await got(item.link);
                    const $1 = cheerio.load(resp.data);
                    item.description = $1('div#print').html();
                } else if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    await finishArticleItem(ctx, item);
                } else {
                    item.description = '本文需跳转，请点击标题后阅读';
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `水声工程学院 - ${title}`,
        link: url,
        item,
    };
};
