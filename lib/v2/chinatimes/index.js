const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { puppeteerGet } = require('./utils');
const timezone = require('@/utils/timezone');

const base_url = 'https://www.chinatimes.com';
const config = {
    realtimenews: {
        link: '/realtimenews/?chdtv',
        title: '即時',
    },
    politic: {
        link: '/politic/?chdtv',
        title: '政治',
    },
    opinion: {
        link: '/opinion/?chdtv',
        title: '言論',
    },
    life: {
        link: '/life/?chdtv',
        title: '生活',
    },
    star: {
        link: '/star/?chdtv',
        title: '娛樂',
    },
    money: {
        link: '/money/?chdtv',
        title: '財經',
    },
    society: {
        link: '/society/?chdtv',
        title: '社會',
    },
    hottopic: {
        link: '/hottopic/?chdtv',
        title: '網推',
    },
    health: {
        link: '/health/?chdtv',
        title: '健康',
    },
    tube: {
        link: '/tube/?chdtv',
        title: '有影',
    },
    world: {
        link: '/world/?chdtv',
        title: '國際',
    },
    armament: {
        link: '/armament/?chdtv',
        title: '軍事',
    },
    chinese: {
        link: '/chinese/?chdtv',
        title: '兩岸',
    },
    fashion: {
        link: '/fashion/?chdtv',
        title: 'China Times - Fashion',
    },
    sports: {
        link: '/sports/?chdtv',
        title: '體育',
    },
    technologynews: {
        link: '/technologynews/?chdtv',
        title: '科技',
    },
    fortune: {
        link: '/fortune/?chdtv',
        title: '運勢',
    },
    taiwan: {
        link: '/taiwan/?chdtv',
        title: '寶島',
    },
};

module.exports = async (ctx) => {
    const catyUrl = `${base_url}${config[ctx.params.category].link}`;
    // use Puppeteer due to the obstacle by cloudflare challenge
    const html = await puppeteerGet(catyUrl, ctx.cache);
    const $ = cheerio.load(html);
    const detailsUrls = $('.title > a')
        .map((index, element) => $(element).attr('href'))
        .get();
    const items = await Promise.all(
        detailsUrls.map(async (url) => {
            let newUrl;
            if (url.indexOf('chinatimes.com') === -1) {
                newUrl = base_url + url;
            } else {
                newUrl = url;
            }
            const detail = await puppeteerGet(newUrl, ctx.cache);
            const $d = cheerio.load(detail);
            return {
                title: $d('meta[property="og:title"]').attr('content'),
                link: url,
                description: $d('.article-body').html(),
                pubDate: timezone(parseDate($d('meta[name="pubdate"]').attr('content')), +8),
                author: $d('.author').text(),
                category: config[ctx.params.category].title,
            };
        })
    );

    ctx.state.data = {
        title: $('head title').text(),
        link: catyUrl,
        item: items,
    };
};
