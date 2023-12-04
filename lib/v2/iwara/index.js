const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;

const rootUrl = 'https://www.iwara.tv';
const apiRootUrl = 'https://api.iwara.tv';
const imageRootUrl = 'https://i.iwara.tv';

const typeMap = {
    video: 'Videos',
    image: 'Images',
};

const apiUrlMap = {
    video: `${apiRootUrl}/videos`,
    image: `${apiRootUrl}/images`,
};

const parseThumbnail = (type, item) => {
    if (type === 'image') {
        return `<img src="${imageRootUrl}/image/original/${item.thumbnail.id}/${item.thumbnail.name}">`;
    }

    if (item.embedUrl === null) {
        return `<img src="${imageRootUrl}/image/original/${item.file.id}/thumbnail-${String(item.thumbnail).padStart(2, '0')}.jpg">`;
    }

    // regex borrowed from https://stackoverflow.com/a/3726073
    const match = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&(amp;)?[\w?=]*)?/.exec(item.embedUrl);
    if (match) {
        return `<img src="${imageRootUrl}/image/embed/original/youtube/${match[1]}">`;
    }

    return '';
};

module.exports = async (ctx) => {
    const username = ctx.params.username;
    const id = await ctx.cache.tryGet(`${apiRootUrl}/profile/${username}`, async () => (await got(`${apiRootUrl}/profile/${username}`)).data.user.id);
    const type = ctx.params.type ?? 'video';
    const items = (await ctx.cache.tryGet(`${apiUrlMap[type]}?user=${id}`, async () => (await got(`${apiUrlMap[type]}?user=${id}`)).data.results, config.cache.routeExpire, false)).map((item) => ({
        title: item.title,
        author: username,
        link: `${rootUrl}/${type}/${item.id}/${item.slug}`,
        category: item.tags.map((i) => i.id),
        description: parseThumbnail(type, item),
        pubDate: parseDate(item.createdAt),
    }));

    ctx.state.data = {
        title: `${username}'s iwara - ${typeMap[type]}`,
        link: `${rootUrl}/users/${username}`,
        item: items,
    };
};
