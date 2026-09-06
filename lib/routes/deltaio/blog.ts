import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/deltaio/blog',
    parameters: {},
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
            source: ['delta.io/blog'],
        },
    ],
    name: 'Blogs',
    maintainers: ['RengarLee'],
    handler,
    url: 'delta.io/blog',
};

async function handler() {
    const baseUrl = 'https://delta.io';
    const dataUrl = `${baseUrl}/page-data/blog/page-data.json`;

    const data = await cache.tryGet(
        dataUrl,
        async () => {
            const { data } = await got(dataUrl);
            return data;
        },
        config.cache.routeExpire,
        false
    );

    const items = data.result.data.allMdx.edges.map(({ node }) => ({
        title: node.frontmatter.title,
        description: node.frontmatter.description,
        author: node.frontmatter.author,
        pubDate: parseDate(node.frontmatter.date),
        link: `${baseUrl}${node.fields.slug}`,
        itunes_item_image: `${baseUrl}${node.frontmatter.thumbnail.childImageSharp.gatsbyImageData.images.fallback.src}`,
    }));

    return {
        title: 'delta.io blog',
        link: `${baseUrl}/blog`,
        item: items,
    };
}
