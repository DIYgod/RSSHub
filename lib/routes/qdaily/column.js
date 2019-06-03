const cheerio = require('cheerio');
const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const url = `http://www.qdaily.com/special_columns/${ctx.params.id}.html`;

    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.article').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            let time = $('.smart-date').attr('data-origindate');
            let title = $('.title').text();
            if (!title) {
                title = $('.smart-dotdotdot').text();
            }
            if (!title) {
                const mmTitle = $('.makemoney-title').text();
                const description = $('.makemoney-discription').text();
                title = mmTitle + '：' + description;
                time = new Date();
            }

            const itemUrl = $('a').attr('href');
            const allUrl = `http://www.qdaily.com${itemUrl}`;
            const cache = await ctx.cache.get(allUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
                link: allUrl,
                guid: allUrl,
            };
            proList.push(axios.get(allUrl));
            indexList.push(i);
            return Promise.resolve(single);
        })
    );
    const responses = await axios.all(proList);
    for (let i = 0; i < responses.length; i++) {
        const res = responses[i];
        const $ = cheerio.load(res.data);

        $('img').each((index, item) => {
            item = $(item);
            item.attr('src', item.attr('data-src'));
            item.attr('referrerpolicy', 'no-referrer');
        });
        $('.article-detail-bd .author-share').remove();
        $('.article-detail-ft').remove();

        if (out[indexList[i]].link.match('/weeklies/')) {
            out[indexList[i]].description = $('.packery-container').html();
        } else {
            out[indexList[i]].description = $('.main .com-article-detail').html();
        }

        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
