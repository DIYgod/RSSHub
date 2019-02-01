const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');

const map = new Map([[1, { title: '南京理工大学研究生院 -- 通知公告', id: '/sytzgg_4568' }], [2, { title: '南京理工大学研究生院 -- 学术公告', id: '/xshdggl' }]]);

module.exports = async (ctx) => {
    const type = Number.parseInt(ctx.params.type);
    const id = map.get(type).id;
    const baseURL = 'http://gs.njust.edu.cn';
    const res = await axios({
        method: 'get',
        url: baseURL + id + '/list.htm',
        headers: {
            Referer: 'https://gs.njust.edu.cn/',
        },
    });
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('.wp_article_list li');

    ctx.state.data = {
        title: map.get(type).title,
        link: 'https://gs.njust.edu.cn',
        // description: '',

        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    return {
                        title: item.find('a').text(),
                        link: `${baseURL + $(item.find('a')).attr('href')}`,
                        pubDate: new Date(item.find('.Article_PublishDate').text()).toUTCString(),
                    };
                })
                .get(),
    };
};
