const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { owner, image, tag = 'latest' } = ctx.params;

    const namespace = `${owner}/${image}`;

    const link = `https://hub.docker.com/r/${namespace}`;

    const data = await got.get(`https://hub.docker.com/v2/repositories/${namespace}/tags/${tag}`);
    const metadata = await got.get(`https://hub.docker.com/v2/repositories/${namespace}/`);

    const item = data.data;

    ctx.state.data = {
        title: `${namespace}:${tag} build history`,
        description: metadata.data.description,
        link,
        item: [
            {
                title: `${namespace}:${tag} was built. ${(item.images[0].size / 1000000).toFixed(2)} MB`,
                link: `https://hub.docker.com/layers/docker/${namespace}/${tag}/images/${item.images[0].digest.replace(':', '-')}`,
                author: owner,
                pubDate: new Date(item.last_updated).toUTCString(),
                guid: item.last_updated,
            },
        ],
    };
};
