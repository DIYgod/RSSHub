const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const types = ['social-media', 'programming', 'live', 'multimedia', 'picture', 'anime', 'program-update', 'university', 'traditional-media', 'forecast', 'travel', 'shopping', 'game', 'reading', 'government', 'other'];
    const all = await Promise.all(
        types.map(async (type) => {
            const response = await axios({
                method: 'get',
                url: `https://docs.rsshub.app/${type}.html`,
            });

            const data = response.data;

            const $ = cheerio.load(data);
            const item = $('.routeBlock').get();
            return Promise.resolve({ item, type });
        })
    );
    const list = [];
    all.forEach(({ item, type }) => {
        item.forEach((item) => {
            list.push({ item, type });
        });
    });

    ctx.state.data = {
        title: 'RSSHub 有新路由啦',
        link: 'https://docs.rsshub.app',
        description: '万物皆可 RSS',
        item:
            list &&
            list.map(({ item, type }) => {
                item = cheerio(item);
                item.find('.header-anchor').remove();
                const titleEle = item.prevAll('h2').eq(0);
                return {
                    title: `${titleEle[0].attribs.id} - ${item
                        .prevAll('h3')
                        .eq(0)
                        .text()
                        .slice(2)}`,
                    description: item.html(),
                    link: `https://docs.rsshub.app/${type}.html#${encodeURIComponent(
                        titleEle.find('.header-anchor').attr('href') &&
                            titleEle
                                .find('.header-anchor')
                                .attr('href')
                                .slice(1)
                    )}`,
                    guid: item.attr('id'),
                };
            }),
    };
};
