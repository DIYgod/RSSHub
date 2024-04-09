const got = require('@/utils/got');
const cheerio = require('cheerio');

const { rootUrl, mobileRootUrl } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const currentUrl = `${rootUrl}/Comic/comicInfo/id/${id}`;
    const mobileCurrentUrl = `${mobileRootUrl}/comic/index/id/${id}`;

    const response = await got({
        method: 'get',
        url: mobileCurrentUrl,
    });

    const $ = cheerio.load(response.data);

    const author = $('.author-wr')
        .toArray()
        .map((a) => $(a).text().trim())
        .join(', ');

    const items = $('.reverse .bottom-chapter-item .chapter-link')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                author,
                title: item.text(),
                description: `<img src="${item.find('.cover-image').attr('src')}">`,
                link: `${rootUrl}${item.attr('href').replace(/chapter/, 'ComicView')}`,
            };
        });

    ctx.state.data = {
        title: `${$('h1').text()} - 腾讯动漫`,
        link: currentUrl,
        item: items,
        description: `<p>${$('.head-info-desc').text()}</p>`,
    };
};
