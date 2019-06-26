const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const _ = require('lodash');

const baseUrl = 'http://tj.ustb.edu.cn';
const maps = {
    xyxw: '/Class/xyxw/index.htm',
    xshhd: '/Class/xshhd/index.htm',
    csjsxy: '/Class/csjsxy/index.htm',
    xxgcxy: '/Class/xxgcxy/index.htm',
    jjx: '/Class/jjx/index.htm',
    glxy: '/Class/glxy/index.htm',
    clx: '/Class/clx/index.htm',
    jxgcx: '/Class/jxgcx/index.htm',
    hlx: '/Class/hlx/index.htm',
    flx: '/Class/flx/index.htm',
    wyx: '/Class/wyx/index.htm',
    ysx: '/Class/ysx/index.htm',
};

function getNews(data) {
    const $ = cheerio.load(data);
    return $('div[class="classnews"] ul li a')
        .slice(0, 5)
        .map((_, elem) => ({
            link: baseUrl + elem.attribs.href,
            title: elem.children[0].data,
            pubDate: dayjs(elem.attribs.href.split('/')[3].split('.')[0]).toString(),
        }))
        .get();
}

module.exports = async (ctx) => {
    let type = ctx.params.type || 'all';
    if (!_.includes(_.keys(maps), type)) {
        type = 'all';
    }

    const responseData = {
        title: '北京科技大学天津学院新闻动态',
        link: baseUrl,
        item: null,
    };

    if (type === 'all') {
        const all = await Promise.all(
            Object.values(maps).map(async (link) => {
                const response = await got.get(baseUrl + link);
                const news = getNews(response.data);
                return Promise.resolve(news);
            })
        );
        responseData.item = _.orderBy(_.flatMapDepth(all), (res) => new Date(res.pubDate), ['desc']);
    } else {
        const response = await got.get(baseUrl + maps[type]);
        const news = getNews(response.data);
        responseData.item = news;
    }

    ctx.state.data = responseData;
};
