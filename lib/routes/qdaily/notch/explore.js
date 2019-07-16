const got = require('@/utils/got');

const headers = {
    'User-Agent': 'QdailyNotch/3.2.3 (iPhone; iOS 12.3.1; Scale/3.00)',
    Host: 'notch.qdaily.com',
};

const ProcessFeed = async (type, item) => {
    const processPhoto = (pics) => {
        let description = '<div style="text-align: center">';
        pics.forEach((pic) => {
            description += `<img src='${pic.preview_pic}' referrerpolicy="no-referrer"> <br> <a href='${pic.original_pic.split('?imageMogr2/')[0]}'>下载原图</a> <br> <br>`;
        });

        description += '</div>';
        return description;
    };

    switch (type) {
        case 'lab':
            return `<div style="text-align: center"><img src='${item.index_info.index_pic}' referrerpolicy="no-referrer"> <br> ${item.post.description} <br>  <a href='${item.post.share.url}'>参与讨论</a></div>`;
        case 'long_photo':
            return processPhoto(item.long_photos);
        case 'photo':
            return processPhoto(item.photos);
    }
};

module.exports = async (ctx) => {
    const meta = await got({
        method: 'get',
        url: `http://notch.qdaily.com/api/v3/tags/${ctx.params.id}`,
        headers,
    });

    const data = meta.data.response.tag;

    const post = await got({
        method: 'get',
        url: `http://notch.qdaily.com/api/v3/tags/post_index?id=${ctx.params.id}`,
        headers,
    });

    const posts = post.data.response.feeds;

    const items = await Promise.all(
        posts.map(async (item) => {
            const post = item.post;
            return {
                title: post.title,
                description: await ProcessFeed(data.index_type, item),
                link: post.share.url,
                pubDate: new Date(post.published_at * 1000).toUTCString(),
                author: data.title,
            };
        })
    );

    ctx.state.data = {
        title: `好奇怪 - ${data.title}`,
        link: `http://notch.qdaily.com/`,
        description: data.description,
        item: items,
    };
};
