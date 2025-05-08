import { Context } from 'hono';
import { Data, Route, ViewType } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/build/:owner/:image/:tag?',
    categories: ['program-update', 'popular'],
    view: ViewType.Notifications,
    example: '/dockerhub/build/diygod/rsshub/latest',
    parameters: {
        owner: 'Image owner, the owner of the official image fills in the library, for example: /dockerhub/build/library/mysql',
        image: 'Image name',
        tag: {
            description: 'Image tag',
            default: 'latest',
        },
    },
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
};

async function handler(ctx: Context) {
    const { owner, image, tag = 'latest' } = ctx.req.param();

    const namespace = `${owner}/${image}`;
    const item = await utils.getTag(namespace, tag);
    const metadata = await utils.getMetadata(namespace);
    const link = utils.getRepositoryLink(owner, image);
    const firstImage = utils.sortedImages(item.images)[0];

    return {
        title: `${namespace}:${tag} build history`,
        description: metadata.description,
        link,
        language: 'en',
        item: [
            {
                title: `${namespace}:${tag} was built. ${(firstImage.size / 1_000_000).toFixed(2)} MB`,
                link: utils.getLayerLink(owner, image, tag, firstImage.digest),
                author: owner,
                pubDate: utils.getPubDate(item),
                // only check for different images hashes (considering varients of all arches), since the tag name is already fixed
                guid: utils.getGuid(namespace, item),
            },
        ],
    } as Data;
}
