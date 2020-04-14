const got = require('@/utils/got');

module.exports = async (ctx) => {
    const blogdomain = `${ctx.params.username}.lofter.com`;
    const response = await got({
        method: 'post',
        url: `http://api.lofter.com/v2.0/blogHomePage.api?product=lofter-iphone-6.8.2`,
        headers: {
            Host: 'api.lofter.com',
            'User-Agent': 'LOFTER/6.8.2 (iPhone; iOS 13.4; Scale/2.00)',
        },
        form: {
            blogdomain: blogdomain,
            checkpwd: '1',
            following: '0',
            limit: '15',
            method: 'getPostLists',
            needgetpoststat: '1',
            offset: '0',
            postdigestnew: '1',
            supportposttypes: '1,2,3,4,5,6',
        },
    });
    const data = response.data.response.posts;
    ctx.state.data = {
        title: `${ctx.params.username}.lofter.com`,
        link: blogdomain,
        description: `${ctx.params.username}.lofter.com`,
        item: data.map((item) => {
            let content = item.post.content;
            const title = item.post.title || item.post.noticeLinkTitle;
            const photos = JSON.parse(item.post.photoLinks || `[]`);
            const images = [];
            photos.forEach((photo) => {
                images.push(`<p><img src="${photo.raw}"/></p>`);
            });
            content = `${content}${images.join('')}`;
            return {
                title: title,
                description: content,
                pubDate: new Date(item.post.publishTime).toUTCString(),
                link: item.post.blogPageUrl,
                guid: item.post.blogPageUrl,
                author: item.post.blogInfo.blogNickName,
            };
        }),
    };
};
