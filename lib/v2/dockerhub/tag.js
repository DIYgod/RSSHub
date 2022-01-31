const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { owner, image } = ctx.params;

    const namespace = `${owner}/${image}`;

    const link = `https://hub.docker.com/r/${namespace}`;

    const data = await got.get(`https://hub.docker.com/v2/repositories/${namespace}/tags/`);
    const metadata = await got.get(`https://hub.docker.com/v2/repositories/${namespace}/`);

    const tags = data.data.results;

    ctx.state.data = {
        title: `${namespace} tags`,
        description: metadata.data.description,
        link,
        language: 'en',
        item: tags.map((item) => ({
            title: `${namespace}:${item.name} was updated`,
            description: `${namespace}:${item.name} was updated, supporting the architectures of ${item.images.map((img) => `${img.os}/${img.architecture}`).join(', ')}`,
            link: `https://hub.docker.com/layers/${owner === 'library' ? `${image}/` : ''}${namespace}/${item.name}/images/${item.images[0].digest.replace(':', '-')}`,
            author: owner,
            pubDate: new Date(item.tag_last_pushed).toUTCString(),
            guid: item.tag_last_pushed,
        })),
    };
};
