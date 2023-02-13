const got = require('@/utils/got');
const cheerio = require('cheerio');
const { isValidHost } = require('@/utils/valid-host');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { parseArticle } = require('./utils');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const column = ctx.params.column;
    const url = `https://${column}.caixin.com/${category}`;
    if (!isValidHost(column)) {
        throw Error('Invalid column');
    }

    const response = await got(url);

    const $ = cheerio.load(response.data);
    const title = $('head title').text();
    const entity = JSON.parse(
        $('script')
            .text()
            .match(/var entity = (\{.*?\})/)[1]
    );

    const {
        data: { datas: data },
    } = await got('https://gateway.caixin.com/api/extapi/homeInterface.jsp', {
        searchParams: {
            subject: entity.id,
            type: 0,
            count: ctx.query.limit ? parseInt(ctx.query.limit) : 25,
            picdim: '_266_177',
            start: 0,
        },
    });

    const list = data.map((item) => ({
        title: item.desc,
        description: item.summ,
        link: item.link.replace('http://', 'https://'),
        pubDate: timezone(parseDate(item.time), +8),
        category: item.keyword.split(' '),
        audio: item.audioUrl,
        audio_image_url: item.pict.imgs[0].url,
    }));

    const items = await Promise.all(list.map((item) => parseArticle(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title,
        link: url,
        description: '财新网 - 提供财经新闻及资讯服务',
        item: items,
    };
};
