const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const api = `https://www.nationalgeographic.com/content/photography/en_US/photo-of-the-day/_jcr_content/.gallery.${year}-${month}.json`;
    const response = await axios.get(api);
    const items = response.data.items;

    const out = items.slice(0, 10).map((item) => {
        const info = {
            title: item.altText,
            author: item.credit,
            link: item['full-path-url'],
            description: `<img referrerpolicy="no-referrer" src="${item.sizes[1024]}">` + item.caption,
        };
        return info;
    });

    ctx.state.data = {
        title: 'Photo of the Day',
        link: 'https://www.nationalgeographic.com/photography/photo-of-the-day/',
        item: out,
    };
};
