const got = require('@/utils/got');
const config = require('@/config').value;
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');
const path = require('path');
const md = require('markdown-it')({
    html: true,
});

module.exports = async (ctx) => {
    const rootUrl = `https://www.iwara.tv`;
    const videoSubUrl = 'https://api.iwara.tv/videos?page=0&limit=30&subscribed=true';
    const imageSubUrl = 'https://api.iwara.tv/images?page=0&limit=30&subscribed=true';
    const cookie = config.iwara.cookie;

    if (cookie === undefined) {
        throw Error('Iwara subscription RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }

    const videoResponse = await got({
        method: 'get',
        url: videoSubUrl,
        headers: {
            Cookie: cookie,
        },
    });

    const imageResponse = await got({
        method: 'get',
        url: imageSubUrl,
        headers: {
            Cookie: cookie,
        },
    });

    const videoList = videoResponse.data.results.map((item) => {
        const imageUrl = item.file ? 'https://i.iwara.tv/image/original/' + item.file.id.toString().padStart(2, '0') + '/thumbnail-' + item.thumbnail.toString().padStart(2, '0') + '.jpg' : '';
        return {
            title: item.title,
            author: item.user.name,
            link: rootUrl + '/video/' + item.id,
            category: 'Video',
            imageUrl,
            pubDate: parseDate(item.createdAt),
        };
    });

    const imageList = imageResponse.data.results.map((item) => {
        const imageUrl = item.thumbnail ? 'https://i.iwara.tv/image/thumbnail/' + item.thumbnail.id + '/' + item.thumbnail.id + '.jpg' : '';
        return {
            title: item.title,
            author: item.user.name,
            link: rootUrl + '/image/' + item.id,
            category: 'Image',
            imageUrl,
            pubDate: parseDate(item.createdAt),
        };
    });

    const list = videoList.concat(imageList);

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const link = item.link.replace('www.iwara.tv', 'api.iwara.tv');
                const response = await got({
                    method: 'get',
                    url: link,
                    headers: {
                        Cookie: cookie,
                    },
                });
                const type = item.category;
                const imageUrl = item.imageUrl;
                const body = response.data.body ? md.render(response.data.body) : '';

                item.description = art(path.join(__dirname, 'templates/subscriptions.art'), {
                    type,
                    imageUrl,
                });
                item.description += body;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `Iwara Subscription`,
        link: rootUrl,
        item: items,
    };
};
