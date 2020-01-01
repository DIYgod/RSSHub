const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'http://www.zucc.edu.cn';
const maps = {
    news: '/col/col16/index.html?uid=457',
};

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseUrl + maps.news,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const xml = $('#457 > script');
    const xmlGet = xml.html().toString();
    const match = '<li>.*?<a.*?href=".*?".*?title=".*?".*?target=".*?">.*?</a><span>.*?</span>.*?</li>';
    const reg = new RegExp(match, 'g');
    const res = xmlGet.match(reg);

    // eslint-disable-next-line no-unused-vars
    const chapterItem = res.map((elem) => ({
        link:
            baseUrl +
            elem
                .match('href=".*?"')[0]
                .toString()
                .slice(6, -1),
        title: elem
            .match('title=".*?"')[0]
            .toString()
            .slice(7, -1),
        pubDate: elem
            .match('<span>.*?</span>')[0]
            .toString()
            .slice(6, -7),
    }));

    ctx.state.data = {
        title: '浙江大学城市学院新闻报道',
        link: baseUrl,
        item: chapterItem,
    };
};
