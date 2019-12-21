const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

const types = {
    beauty: '美女',
    travel_places: '旅行',
    photography: '摄影',
	  illustration: '漫画',
	  anime: '动漫',
	  pets: '宠物',
	  quotes: '美图',
	  people: '明星'
};

module.exports = async (ctx) => {
    const type = ctx.params.type ? ctx.params.type : 'beauty';

	const baseUrl = `https://huaban.com`;
    const url = `https://huaban.com/discovery/?category=${type}`;

    const list_response = await got.get(url);
    const $ = cheerio.load(list_response.data);

    const list = $('.pin.wfc').toArray();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.description');
            const link = baseUrl+$('a.img').attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const rssitem = {
                title: title.text().trim(),
                link: link,
            };

            try {
                const response = await got.get(link);
                const result = utils.parseContent(response.data);

                rssitem.author = result.author;
                rssitem.description = result.description;
                rssitem.pubDate = result.pubDate;
            } catch (err) {
                return Promise.resolve('');
            }
            ctx.cache.set(link, JSON.stringify(rssitem));
            return Promise.resolve(rssitem);
        })
    );

    ctx.state.data = {
        title: `花瓣-${types[type]}`,
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
