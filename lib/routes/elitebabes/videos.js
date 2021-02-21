const utils = require('./utils');

const sorts = {
    popular: {
        url: '',
        title: 'Popular',
    },
    recent: {
        url: 'latest',
        title: 'Recent',
    },
};

module.exports = async (ctx) => {
    const sort = ctx.params.sort || '';
    const title = `${sort ? sorts[sort].title : 'Popular'} videos - Elite Babes`;

    const currentUrl = `${utils.rootUrl}/videos${sort ? `?sort=${sorts[sort].url}` : ''}`;

    ctx.state.data = {
        title,
        link: currentUrl,
        itunes_author: title,
        item: await utils.fetch(ctx.cache, currentUrl),
    };
};
