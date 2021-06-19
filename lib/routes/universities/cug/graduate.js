const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const baseUrl = 'http://graduate.cug.edu.cn';
    const reqUrl = `${baseUrl}/zhtzgg.htm`;
    const res = await got(reqUrl);
    const selector = 'div.mainWrap > div.main_con > div.main_conR.main_conRa > div.main_conRCb > ul > li';
    const links = cheerio
        .load(res.data)(selector)
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const link = `${baseUrl}/${$item('a').attr('href')}`;
            return link;
        })
        .get();
    const item = await Promise.all(
        links.map((link) =>
            ctx.cache.tryGet(`cug/${link}`, async () => {
                const res = await got(link);
                const $ = cheerio.load(res.data);
                const mainNode = $('.main_content');
                const description = mainNode.find('.main_conDiv').html();
                const title = mainNode.find('.main_contit h2').text();
                const pubTime = mainNode
                    .find('.main_contit p')
                    .text()
                    .split(' ')
                    .find((s) => s.includes('时间'))
                    .replace('时间：', '');
                return {
                    title,
                    description,
                    pubDate: new Date(pubTime).toUTCString(),
                };
            })
        )
    );

    ctx.state.data = {
        title: '中国地址大学(武汉)研究生院 - 综合通知公告',
        description: '中国地址大学(武汉)研究生院 - 综合通知公告',
        link: `${baseUrl}/zhtzgg.htm`,
        item,
    };
};
