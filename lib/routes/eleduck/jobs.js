const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://svc.eleduck.com/api/v1/posts?category=5&page=1`,
    });

    const data = response.data.posts;

    const out = await Promise.all(
        data.map(async (job) => {
            const url = `https://svc.eleduck.com/api/v1/posts/${job.id}`;
            const cache = await ctx.cache.get(url);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await got.get(url);
            const jobDetail = response.data.post;

            const single = {
                title: jobDetail.title,
                link: `https://eleduck.com/posts/${job.id}`,
                author: jobDetail.user.nickname,
                description: jobDetail.content.main,
                pubDate: new Date(jobDetail.published_at).toUTCString(),
            };
            ctx.cache.set(url, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '电鸭社区-工作机会',
        link: 'https://eleduck.com/?category=5',
        item: out,
    };
};
