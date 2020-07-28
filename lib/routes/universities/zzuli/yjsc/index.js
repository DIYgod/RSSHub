const got = require('@/utils/got');
const cheerio = require('cheerio');

const map = new Map([
    [0, { title: '公告通知', link: 'http://yjsc.zzuli.edu.cn/ggtz/list.htm' }],
    [1, { title: '招生工作', link: 'http://yjsc.zzuli.edu.cn/2878/list.htm' }],
    [2, { title: '新闻资讯', link: 'http://yjsc.zzuli.edu.cn/2918/list.htm' }],
    [3, { title: '培养工作', link: 'http://yjsc.zzuli.edu.cn/2882/list.htm' }],
    [4, { title: '学位工作', link: 'http://yjsc.zzuli.edu.cn/2890/list.htm' }],
]);

module.exports = async (ctx) => {
    const type = Number.parseInt(ctx.params.type);
    const id = map.get(type).link;
    const res = await got({
        method: 'get',
        url: `${id}`,
        responseType: 'buffer',
    });

    const $ = cheerio.load(res.data);
    const list = $('div table tbody tr td table tbody tr').slice(0, 10);
    const items =
        list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('td a').attr('title'),
                    link: item.find('td a').attr('href'),
                    pubDate: new Date(item.find('td div').text()),
                };
            })
            .get();

    ctx.state.data = {
        title: map.get(type).title + ' - 郑州轻工业大学研究生处',
        link: map.get(type).link,
        item: items,
    };
};
