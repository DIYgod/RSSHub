const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { hash } = require('./utils');

module.exports = async (ctx) => {
    const { owner, image, limits } = ctx.params;

    const namespace = `${owner}/${image}`;
    const link = `https://hub.docker.com/r/${namespace}`;

    const pageSize = !isNaN(parseInt(limits)) ? parseInt(limits) : 10;

    const data = await got.get(`https://hub.docker.com/v2/repositories/${namespace}/tags/?page_size=${pageSize}`);
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
            pubDate: parseDate(item.tag_last_pushed),
            // check for (1) different tag names and (2) different image hashes, considering varients of all arches
            guid: `${namespace}:${item.name}@${hash(item.images)}`,
        })),
    };
};
