const got = require('@/utils/got');
const { parseArticle } = require('../utils');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 0;
    const currentUrl = `https://m.mp.oeeee.com/show.php?m=Doc&a=getAuthorInfo&id=${id}`;

    const { data: response } = await got(currentUrl);

    const list = response.data.list.map((item) => ({
        title: '【' + item.media_nickname + '】' + item.title,
        description: art(path.join(__dirname, '../templates/description.art'), {
            thumb: item.titleimg,
            description: item.summary,
        }),
        link: item.url,
    }));

    const author = response.data.info ? response.data.info.name : '';

    const items = await Promise.all(list.map((item) => parseArticle(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `南方都市报奥一网 - ${author}`,
        link: `https://m.mp.oeeee.com/w/${id}.html`,
        item: items,
    };
};
