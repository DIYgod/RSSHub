const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.caty = ctx.params.caty || '0';
    ctx.params.age = ctx.params.age || '0';
    ctx.params.sort = ctx.params.sort || '1';

    const currentUrl = `https://mamibuy.com.hk/talk/article/?cid=${ctx.params.caty}&aid=${ctx.params.age}&s=${ctx.params.sort}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    const list = $('div.masonry-item')
        .map((_, item) => {
            item = $(item);
            const photos = item.find('div.content-photo').html();
            const title = item.find('div.content-title').text();
            const subtitle = item.find('div.content-subtitle').text();
            return {
                title,
                link: item.find('a.link-black').attr('href'),
                description: `${photos}<p>${subtitle}</p>`,
            };
        })
        .get();

    ctx.state.data = {
        title: `MamiBuy 媽咪幫`,
        link: currentUrl,
        item: list,
    };
};
