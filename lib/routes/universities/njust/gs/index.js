const got = require('@/utils/got');
const cheerio = require('cheerio');

const map = new Map([
    [1, { title: '南京理工大学研究生院 -- 通知公告', id: '/sytzgg_4568' }],
    [2, { title: '南京理工大学研究生院 -- 学术公告', id: '/xshdggl' }],
]);

module.exports = async (ctx) => {
    const type = Number.parseInt(ctx.params.type);
    const id = map.get(type).id;
    const baseUrl = 'http://gs.njust.edu.cn';
    const res = await got({
        method: 'get',
        url: baseUrl + id + '/list.htm',
        headers: {
            Referer: 'https://gs.njust.edu.cn/',
        },
    });
    const $ = cheerio.load(res.data);
    const list = $('.wp_article_list li').slice(0, 10);

    ctx.state.data = {
        title: map.get(type).title,
        link: 'https://gs.njust.edu.cn',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    return {
                        title: item.find('a').text(),
                        link: `${baseUrl + $(item.find('a')).attr('href')}`,
                        pubDate: new Date(item.find('.Article_PublishDate').text()).toUTCString(),
                    };
                })
                .get(),
    };
};
