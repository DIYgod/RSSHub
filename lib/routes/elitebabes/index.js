const utils = require('./utils');

const categories = {
    hot: {
        url: 'trending',
        title: 'Hot',
    },
    popular: {
        url: 'most-viewed',
        title: 'Popular',
    },
    recent: {
        url: 'latest-updates',
        title: 'Recent',
    },
};

module.exports = async (ctx) => {
    const category = ctx.params.category || '';
    const title = `${category ? `${categories[category].title} - ` : ''}Elite Babes`;

    const currentUrl = `${utils.rootUrl}/${category ? categories[category].url : ''}`;

    ctx.state.data = {
        title,
        link: currentUrl,
        itunes_author: title,
        item: await utils.fetch(ctx.cache, currentUrl),
    };
};
