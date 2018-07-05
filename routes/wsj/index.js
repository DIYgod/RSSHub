const cheerio = require('cheerio');
const axios = require('../../utils/axios');

const base = 'https://cn.wsj.com/zh-hans';
let site = base;
module.exports = async (ctx) => {
    if (ctx.params.cat) {
        site = `${base}/news/${ctx.params.cat}`;
    }
    const res = await axios.get(site);
    const $ = cheerio.load(res.data);
    const news = $('a', 'h3').add('a', 'h4');

    const reqList = [];
    const out = [];
    const indexList = [];

    for (let i = 0; i < news.length; i++) {
        const single = cheerio(news[i]);
        const link = single.attr('href');
        const title = single.text();

        const cache = await ctx.cache.get(link);
        if (cache) {
            out.push(JSON.parse(cache));
            continue;
        }

        out.push({
            title: title,
            link: link,
            guid: link,
        });
        reqList.push(axios.get(link));
        indexList.push(i);
    }

    const resList = await axios.all(reqList);

    for (let i = 0; i < resList.length; i++) {
        const res = resList[i];
        const $ = cheerio.load(res.data);
        let description = '';
        let descriptionNode = $('h2[itemprop=description]');
        if (descriptionNode && descriptionNode.length !== 0) {
            description = descriptionNode.text();
        } else {
            descriptionNode = $('h2[itemprop=caption]');
            if (descriptionNode && descriptionNode.length !== 0) {
                description = descriptionNode.text();
            }
        }
        out[indexList[i]].description = description;
        out[indexList[i]].pubDate = new Date().toUTCString();
    }

    ctx.state.data = {
        title: $('title').text(),
        link: site,
        item: out,
    };
};
