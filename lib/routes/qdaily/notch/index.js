const got = require('@/utils/got');
const cheerio = require('cheerio');

const headers = {
    'User-Agent': 'QdailyNotch/3.2.3 (iPhone; iOS 12.3.1; Scale/3.00)',
    Host: 'notch.qdaily.com',
};

const ProcessFeed = async (id) => {
    const response = await got({
        method: 'get',
        url: `http://notch.qdaily.com/api/v3/posts/${id}?platform=ios`,
        headers,
    });

    const $ = cheerio.load(response.data.response.show_info.body);

    const description = $('.article-detail-bd');

    $('.article-banner > img').insertBefore(description[0].firstChild);

    description.find('.lazyload').each((i, e) => {
        $(e).attr('src', $(e).attr('data-src'));
    });

    return description.html();
};

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://notch.qdaily.com/api/v3/posts',
        headers,
    });

    const data = response.data.response.feeds;
    const items = await Promise.all(
        data.map(async (item) => {
            const post = item.post;
            return {
                title: post.title,
                description: await ProcessFeed(post.id),
                link: post.share.url,
                pubDate: new Date(post.published_at * 1000).toUTCString(),
                author: post.author_info ? post.author_info.username : '',
            };
        })
    );

    ctx.state.data = {
        title: `好奇怪 - 首页`,
        link: `http://notch.qdaily.com/`,
        description: `好奇怪，开启你的脑洞世界。好奇心日报旗下产品。`,
        item: items,
    };
};
