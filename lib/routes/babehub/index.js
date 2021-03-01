const utils = require('./utils');

const categories = {
    'most-viewed': {
        url: 'most-viewed',
        title: 'Most Viewed',
    },
    picture: {
        url: 'picture-archive',
        title: 'Pictures',
    },
    video: {
        url: 'video-archive',
        title: 'Videos',
    },
};

module.exports = async (ctx) => {
    const category = ctx.params.category || '';
    const title = `${category ? `${categories[category].title} - ` : ''}BabeHub`;

    const currentUrl = `${utils.rootUrl}/${category ? categories[category].url : ''}`;

    ctx.state.data = {
        title,
        link: currentUrl,
        itunes_author: title,
        item: await utils.fetch(ctx.cache, currentUrl),
    };
};
