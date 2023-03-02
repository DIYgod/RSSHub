const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { finishArticleItem } = require('@/utils/wechat-mp');

const host = 'https://www.cs.sdu.edu.cn/';
const typelist = ['学院公告', '学术报告', '科技简讯'];
const urlList = ['xygg.htm', 'xsbg.htm', 'kjjx.htm'];

module.exports = async (ctx) => {
    const type = ctx.params.type ? parseInt(ctx.params.type) : 0;
    const link = new URL(urlList[type], host).href;

    const response = await got(link);

    const $ = cheerio.load(response.data);

    let item = $('.dqlb ul li')
        .map((_, e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: a.text().trim(),
                link: a.attr('href').startsWith('info/') ? host + a.attr('href') : a.attr('href'),
                pubDate: parseDate(e.find('.fr').text().trim(), 'YYYY-MM-DD'),
            };
        })
        .get();

    item = await Promise.all(
        item.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    return finishArticleItem(ctx, item);
                } else if (new URL(item.link).hostname !== 'www.cs.sdu.edu.cn') {
                    return item;
                }
                const response = await got(item.link);
                const $ = cheerio.load(response.data);

                item.title = $('.xqnr_tit h2').text().trim();
                item.author = $('.xqnr_tit span').eq(1).text().trim().replace('编辑：', '') || '山东大学计算机科学与技术学院';
                $('.xqnr_tit').remove();
                item.description = $('form[name=_newscontent_fromname]').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `山东大学计算机科学与技术学院${typelist[type]}通知`,
        description: $('title').text(),
        link,
        item,
    };
};
