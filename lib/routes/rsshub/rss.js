const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://docs.rsshub.app',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.routeBlock');

    ctx.state.data = {
        title: 'RSSHub 有新路由啦',
        link: 'https://docs.rsshub.app',
        description: '万物皆可 RSS',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    item.find('.header-anchor').remove();
                    const titleEle = item.prevAll('h3').eq(0);
                    return {
                        title: `${titleEle.text().slice(2)} - ${item
                            .find('.name')
                            .contents()
                            .eq(0)
                            .text()}`,
                        description: item.html(),
                        link: `https://docs.rsshub.app#${encodeURIComponent(
                            titleEle.find('.header-anchor').attr('href') &&
                                titleEle
                                    .find('.header-anchor')
                                    .attr('href')
                                    .slice(1)
                        )}`,
                        guid: item.attr('id'),
                    };
                })
                .get(),
    };
};
