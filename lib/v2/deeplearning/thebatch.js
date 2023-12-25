const got = require('@/utils/got');

module.exports = async (ctx) => {
    const page = await got({
        method: 'get',
        url: `https://www.deeplearning.ai/the-batch/`,
    });
    const nextJs = page.data.match(/<script id="__NEXT_DATA__" type="application\/json">(.*)<\/script>/)[1];
    const nextBuildId = JSON.parse(nextJs).buildId;

    const listing = await got({
        method: 'get',
        url: `https://www.deeplearning.ai/_next/data/${nextBuildId}/the-batch.json`,
    });

    const items = listing.data.pageProps.posts.map((item) => ({
        title: item.title,
        link: `https://www.deeplearning.ai/the-batch/${item.slug}`,
        jsonUrl: `https://www.deeplearning.ai/_next/data/${nextBuildId}/the-batch/${item.slug}.json`,
        pubDate: new Date(item.published_at).toUTCString(),
    }));

    ctx.state.data = {
        title: `The Batch - a new weekly newsletter from deeplearning.ai`,
        link: `https://www.deeplearning.ai/the-batch/`,
        item: await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const resp = await got({ method: 'get', url: item.jsonUrl });
                    item.description = resp.data.pageProps.cmsData.post.html;
                    return item;
                })
            )
        ),
    };
};
