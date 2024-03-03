// @ts-nocheck
import got from '@/utils/got';
const { hash } = require('./utils');

export default async (ctx) => {
    const { owner, image, tag = 'latest' } = ctx.req.param();

    const namespace = `${owner}/${image}`;

    const link = `https://hub.docker.com/r/${namespace}`;

    const data = await got.get(`https://hub.docker.com/v2/repositories/${namespace}/tags/${tag}`);
    const metadata = await got.get(`https://hub.docker.com/v2/repositories/${namespace}/`);

    const item = data.data;

    ctx.set('data', {
        title: `${namespace}:${tag} build history`,
        description: metadata.data.description,
        link,
        item: [
            {
                title: `${namespace}:${tag} was built. ${(item.images[0].size / 1_000_000).toFixed(2)} MB`,
                link: `https://hub.docker.com/layers/docker/${namespace}/${tag}/images/${item.images[0].digest.replace(':', '-')}`,
                author: owner,
                pubDate: new Date(item.last_updated).toUTCString(),
                // only check for different images hashes (considering varients of all arches), since the tag name is already fixed
                guid: hash(item.images),
            },
        ],
    });
};
