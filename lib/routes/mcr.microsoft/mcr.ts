import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/product/:product',
    categories: ['programming', 'program-update'],
    example: '/mcr.microsoft/product/dotnet/framework/runtime',
    parameters: { product: 'repository path in mcr.microsoft.com' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['https://mcr.microsoft.com/en-us/product/:product/tags'],
        },
    ],
    name: 'Product tags in mcr.microsoft.com',
    maintainers: ['margani'],
    handler,
};

async function handler(ctx) {
    const product = ctx.req.param('product');
    const details = await got({
        method: 'get',
        url: `https://mcr.microsoft.com/api/v1/catalog/${product}/details`,
    });
    const tags = await got({
        method: 'get',
        url: `https://mcr.microsoft.com/api/v1/catalog/${product}/tags`,
    });

    return {
        title: `${details.name} - Microsoft Artifact Registry`,
        description: `${details.shortDescription}\n\n ${details.readme}`,
        image: `https://mcr.microsoft.com${details.imagePath}`,
        link: `https://mcr.microsoft.com/en-us/product/${product}`,
        item: tags.map((tag: any) => {
            return {
                title: `${details.name} - ${tag.name}`,
                author: details.publisher,
                description: `Digest: \`${tag.digest}\`\n\n` +
                    `Last modified date: ${new Date(tag.lastModifiedDate).toDateString()}\n\n` +
                    tag.architecture ? 'Architecture: ' + tag.architecture + '\n\n' : '' +
                        tag.operatingSystem ? 'Operating system: ' + tag.operatingSystem + '\n\n' : '',
                pubDate: new Date(tag.lastModifiedDate),
                guid: `mcr::${product}::${tag.name}::${tag.digest}`,
                link: `https://mcr.microsoft.com/en-us/product/${product}/tags/${tag.name}/${tag.digest}`,
            }
        }),
    };
}
