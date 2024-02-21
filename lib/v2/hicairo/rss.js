const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rssUrl = 'https://www.hicairo.com/feed.php';

module.exports = async (ctx) => {
    const rss = await got(rssUrl);
    const tt = cheerio.load(rss.data, { xmlMode: true });
//    const items = $('rss > channel > item');
    console.log (tt);
    ctx.state.data = {
        title: "HiFeng'Blog",
        link: "HiFeng'Blog",
        item: "HiFeng'Blog",
    };
    

};
