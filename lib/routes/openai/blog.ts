import { Route } from '@/types';
import got from '@/utils/got';
import { toTitleCase } from '@/utils/common-utils';
import { getApiUrl, parseArticle } from './common';

export const route: Route = {
    path: '/blog/:tag?',
    categories: ['programming'],
    example: '/openai/blog',
    parameters: { tag: 'Tag, see below, All by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Blog',
    maintainers: ['StevenRCE0', 'nczitzk'],
    handler,
    description: `| All | Announcements | Events | Safety & Alignment | Community | Product | Culture & Careers   | Milestones | Research |
| --- | ------------- | ------ | ------------------ | --------- | ------- | ------------------- | ---------- | -------- |
|     | announcements | events | safety-alignment   | community | product | culture-and-careers | milestones | research |`,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag') || '';

    const rootUrl = 'https://openai.com';
    const blogRootUrl = 'https://openai.com/blog';
    const blogOriginUrl = `${rootUrl}/blog${tag === '' ? '' : `?topics=${tag}`}`;

    const apiUrl = new URL('/api/v1/blog-details', await getApiUrl());

    // Construct API query
    apiUrl.searchParams.append('sort', '-publicationDate,-createdAt');
    apiUrl.searchParams.append('page[size]', '20');
    apiUrl.searchParams.append('page[number]', '1');
    apiUrl.searchParams.append('include', 'media,topics,authors');
    if (tag) {
        apiUrl.searchParams.append('filter[topics][slugs][0]', tag);
    }

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.data.filter((entry) => entry.type === 'blog-details');

    const items = await Promise.all(
        list.map((item) => {
            const attributes = item.attributes;
            return parseArticle(ctx, blogRootUrl, attributes);
        })
    );

    const title = `OpenAI Blog${tag ? ` - ${toTitleCase(tag)}` : ''}`;

    return {
        title,
        link: blogOriginUrl,
        item: items,
    };
}
