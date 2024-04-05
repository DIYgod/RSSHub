import { Route } from '@/types';
import got from '@/utils/got';
import { hash } from './utils';

export const route: Route = {
    path: '/build/:owner/:image/:tag?',
    categories: ['program-update'],
    example: '/dockerhub/build/wangqiru/ttrss',
    parameters: { owner: 'Image owner', image: 'Image name', tag: 'Image tag，default to latest' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Image New Build',
    maintainers: ['HenryQW'],
    handler,
    description: `:::warning
  The owner of the official image fills in the library, for example: [https://rsshub.app/dockerhub/build/library/mysql](https://rsshub.app/dockerhub/build/library/mysql)
  :::`,
};

async function handler(ctx) {
    const { owner, image, tag = 'latest' } = ctx.req.param();

    const namespace = `${owner}/${image}`;

    const link = `https://hub.docker.com/r/${namespace}`;

    const data = await got.get(`https://hub.docker.com/v2/repositories/${namespace}/tags/${tag}`);
    const metadata = await got.get(`https://hub.docker.com/v2/repositories/${namespace}/`);

    const item = data.data;

    return {
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
    };
}
