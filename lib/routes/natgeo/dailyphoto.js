const got = require('@/utils/got');

module.exports = async (ctx) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const api = `https://www.nationalgeographic.com/content/photography/en_US/photo-of-the-day/_jcr_content/.gallery.${year}-${month}.json`;
    const response = await got.get(api);
    const items = response.data.items;

    const out = items.slice(0, 10).map((item) => {
        const info = {
            title: item.image.title,
            author: item.image.credit && item.image.credit.replace('Photograph by ', ''),
            link: item.pageUrl,
            description: `<img src="${item.image.uri}">` + item.image.caption,
        };
        return info;
    });

    ctx.state.data = {
        title: 'Photo of the Day',
        link: 'https://www.nationalgeographic.com/photography/photo-of-the-day/',
        item: out,
    };
};
