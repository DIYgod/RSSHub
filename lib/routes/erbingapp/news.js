const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://api.diershoubing.com:5001/feed/tag/?pn=0&rn=20&tag_type=0&src=ios`,
        resolveBodyOnly: true,
        responseType: 'json',
    });
    const data = response.feeds;

    ctx.state.data = {
        title: `二柄APP`,
        link: `https://www.diershoubing.com/`,
        description: `二柄APP新闻`,
        item: data.map((item) => {
            let description = item.content;
            if (item.video_img !== null) {
                description += `<br><img src="${item.video_img}">`;
            } else if (item.acontent.indexOf('104129') !== -1) {
                description += `<br><img src="${item.article.humb.split('?')[0]}">`;
            } else if (item.acontent.indexOf('.html') !== -1) {
                description += `<br><a href="${item.acontent}">More</a>`;
            } else if (item.acontent.indexOf('"imgs') !== -1) {
                const imgs = item.acontent.split(',');
                for (let i = 1; i < imgs.length; i++) {
                    description += `<br><img src="${imgs[i]}">`;
                }
            } else {
                const imgs = item.acontent.split(',');
                for (let i = 0; i < imgs.length; i++) {
                    description += `<br><img src="${imgs[i]}">`;
                }
            }
            return {
                description,
                link: item.share.url,
                title: item.title,
            };
        }),
    };
};
