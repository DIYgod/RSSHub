import { Context } from 'hono';
import { Data, Route, ViewType } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/tag/:owner/:image/:limits?',
    categories: ['program-update'],
    view: ViewType.Notifications,
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
    maintainers: ['pseudoyu'],
    handler,
    description: `::: warning
  Use \`library\` as the \`owner\` for official images, such as [https://rsshub.app/dockerhub/tag/library/mysql](https://rsshub.app/dockerhub/tag/library/mysql)
:::`,
};

async function handler(ctx: Context) {
    const { owner, image, limits } = ctx.req.param();
    const pageSize = Number.isNaN(Number.parseInt(limits)) ? 10 : Number.parseInt(limits);

    const namespace = `${owner}/${image}`;
    const items = await utils.getTags(namespace, pageSize);
    const metadata = await utils.getMetadata(namespace);
    const link = utils.getRepositoryLink(owner, image);

    return {
        title: `${namespace} tags`,
        description: metadata.description,
        link,
        language: 'en',
        item: items.results.map((item) => {
            const architectures = item.images.map((image) => utils.getArchitecture(image)).join(', ');
            const firstImage = utils.sortedImages(item.images)[0];

            return {
                title: `${namespace}:${item.name} was updated`,
                description: `${namespace}:${item.name} was updated, supporting the ${architectures}`,
                link: utils.getLayerLink(owner, image, item.name, firstImage.digest),
                author: owner,
                pubDate: utils.getPubDate(item),
                guid: utils.getGuid(namespace, item),
            };
        }),
    } as Data;
}
