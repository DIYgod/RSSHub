import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/mcr/product/*',
    categories: ['program-update'],
    example: '/microsoft/mcr/product/dotnet/framework/runtime',
    description: 'Append the repository path after `/mcr/product/`, including nested repository segments.',
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
            source: ['mcr.microsoft.com/en-us/product/*product/tags'],
            target: '/mcr/product/:product',
        },
    ],
    name: 'Product tags in mcr.microsoft.com',
    maintainers: ['margani'],
    handler,
};

async function handler(ctx) {
    const product = ctx.req.path.replace('/microsoft/mcr/product/', '');
    const { data: details } = await got({
        method: 'get',
        url: `https://mcr.microsoft.com/api/v1/catalog/${product}/details?reg=mar`,
    });
    const { data: tags } = await got({
        method: 'get',
        url: `https://mcr.microsoft.com/api/v1/catalog/${product}/tags?reg=mar`,
    });

    return {
        title: `${details.name} - Microsoft Artifact Registry`,
        description: String(details.shortDescription),
        image: `https://mcr.microsoft.com${details.imagePath}`,
        link: `https://mcr.microsoft.com/en-us/product/${product}`,
        item: tags.map((tag: any) => {
            const descriptionItems = [`Digest: \`${tag.digest}\``, `Last modified date: ${new Date(tag.lastModifiedDate).toDateString()}`];

            if (tag.architecture) {
                descriptionItems.push(`Architecture: ${tag.architecture}`);
            }
            if (tag.operatingSystem) {
                descriptionItems.push(`Operating system: ${tag.operatingSystem}`);
            }

            return {
                title: `${details.name} - ${tag.name}`,
                author: details.publisher,
                description: descriptionItems.join('<br />'),
                pubDate: new Date(tag.lastModifiedDate),
                guid: `mcr::${product}::${tag.name}::${tag.digest}`,
                link: `https://mcr.microsoft.com/en-us/product/${product}/tags?name=${tag.name}&digest=${tag.digest}`,
            };
        }),
    };
}
