import utils from './utils.js';

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

export default async (ctx) => {
    const {
        category = ''
    } = ctx.params;
    const title = `${category ? `${categories[category].title} - ` : ''}BabeHub`;

    const currentUrl = `${utils.rootUrl}/${category ? categories[category].url : ''}`;

    ctx.state.data = {
        title,
        link: currentUrl,
        itunes_author: title,
        item: await utils.fetch(ctx.cache, currentUrl),
    };
};
