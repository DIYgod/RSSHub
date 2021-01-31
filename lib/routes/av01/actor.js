const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const url = ctx.params.type ? `https://www.av01.tv/actor/${name}&o=${ctx.params.type}` : `https://www.av01.tv/actor/${name}`;

    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div.col-sm-6.col-md-4.col-lg-4');

    ctx.state.data = {
        title: `${name}的影片`,
        description: `${name}的影片`,
        link: `https://www.av01.tv/actor/${name}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const itemPicUrl = `${item.find('img').attr('data-src')}`;
                    return {
                        title: item.find('span.video-title.title-truncate.m-t-5').text(),
                        description: `翻译${item.find('div.video-added.title-truncate').text()}<br><img src="${itemPicUrl}">`,
                        link: `https://www.av01.tv/${item.find('a').attr('href')}`,
                    };
                })
                .get(),
    };
};
