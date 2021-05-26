const got = require('@/utils/got');
const cheerio = require('cheerio');
const host = 'http://www.career.zju.edu.cn/jyxt/jygz/new/getContent.zf?minCount=0&maxCount=10&';

const map = new Map([
    [1, { title: '浙大就业服务平台 -- 新闻动态', id: 'lmjdid=739BEBB72A072B25E0538713470A6C41&sjlmid=undefined&lmtype=2&lx=2&_=670' }],
    [2, { title: '浙大就业服务平台 -- 活动通知', id: 'lmjdid=739BEBB72A0B2B25E0538713470A6C41&sjlmid=undefined&lmtype=2&lx=2&_=1196' }],
    [3, { title: '浙大就业服务平台 -- 学院动态', id: 'lmjdid=739BEBB72A0C2B25E0538713470A6C41&sjlmid=undefined&lmtype=2&lx=2&_=8' }],
    [4, { title: '浙大就业服务平台 -- 告示通告', id: 'lmjdid=739BEBB72A252B25E0538713470A6C41&sjlmid=undefined&lmtype=2&lx=2&_=15' }],
]);

module.exports = async (ctx) => {
    const type = Number.parseInt(ctx.params.type);
    const id = map.get(type).id;
    const res = await got({
        method: 'get',
        url: host + `${id}`,
    });

    const $ = cheerio.load(res.data);
    const list = $('.com-list').find('li').slice(0, 10);
    const items =
        list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    // title: item.find('a').attr('title'),
                    title: item.find('.news-ctn').text(),
                    pubDate: new Date(item.find('.new-time').text()).toUTCString(),

                    link: `www.career.zju.edu.cn${item.find('a').eq(0).attr('href')}`,
                };
            })
            .get();

    ctx.state.data = {
        title: map.get(type).title,
        link: host + `${id}`,
        item: items,
    };
};
