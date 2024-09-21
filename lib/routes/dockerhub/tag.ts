import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { hash } from './utils';

export const route: Route = {
    path: '/tag/:owner/:image/:limits?',
    categories: ['program-update'],
    example: '/dockerhub/tag/library/mariadb',
    parameters: { owner: 'Image owner', image: 'Image name', limits: 'Tag count, 10 by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Image New Tag',
    maintainers: [],
    handler,
    description: `:::warning
  Use \`library\` as the \`owner\` for official images, such as [https://rsshub.app/dockerhub/tag/library/mysql](https://rsshub.app/dockerhub/tag/library/mysql)
  :::`,
};

async function handler(ctx) {
    const { owner, image, limits } = ctx.req.param();

    const namespace = `${owner}/${image}`;
    const link = `https://hub.docker.com/r/${namespace}`;

    const pageSize = isNaN(Number.parseInt(limits)) ? 10 : Number.parseInt(limits);

    const data = await got.get(`https://hub.docker.com/v2/repositories/${namespace}/tags/?page_size=${pageSize}`);
    const metadata = await got.get(`https://hub.docker.com/v2/repositories/${namespace}/`);

    const tags = data.data.results;

    return {
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
}
