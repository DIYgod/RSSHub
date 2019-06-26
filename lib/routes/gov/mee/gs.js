const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const linkBase = `http://www.mee.gov.cn/xxgk/gs/gsq/`;
    const listData = await got.get(linkBase);
    const $ = cheerio.load(listData.data);
    ctx.state.data = {
        title: `公示 - 中华人民共和国生态环境部`,
        link: linkBase,
        item: await Promise.all(
            $('.main .main_top li')
                .map(async (_, el) => {
                    const $el = $(el);
                    const $a = $el.find('>a');
                    const href = $a.attr('href');
                    const key = `gov_gs: ${href}`;
                    let description;
                    const value = await ctx.cache.get(key);

                    // 移除 href 中的 ./，并且拼接原来的 url
                    const link = `${linkBase}${href.slice(2)}`;

                    if (value) {
                        description = value;
                    } else {
                        const contentData = await got.get(link);
                        const $content = cheerio.load(contentData.data);
                        description = $content('.TRS_Editor').html();
                        ctx.cache.set(key, description);
                    }

                    const title = $a.text();

                    // 获取 date
                    const pubDate = new Date(
                        $el
                            .find('.shover')
                            .first()
                            .text()
                            .match(/\d{4}-\d{2}-\d{2}/)
                    ).toUTCString();

                    return {
                        title,
                        description,
                        link,
                        pubDate,
                    };
                })
                .get()
        ),
    };
};
