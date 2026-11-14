import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const apiUrl = 'https://gql-beta.hashnode.com/';
const slugPattern = /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i;

type Publication = { title: string; url: string; domainInfo: { hashnodeSubdomain: string } };
type UserResponse = {
    data?: { user?: { publications: { edges: Array<{ node: Publication }> } } };
    errors?: Array<{ message: string; extensions?: { code?: string } }>;
};

export const route: Route = {
    path: '/blog/:username',
    categories: ['blog'],
    example: '/hashnode/blog/philnash',
    parameters: { username: 'Hashnode 用户名，或 hashnode.dev 前面的博客子域名' },
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
            source: ['hashnode.dev/'],
        },
    ],
    name: '用户博客',
    maintainers: ['hnrainll'],
    handler,
    url: 'hashnode.dev/',
    description: '用户名与博客子域名相同或账号只关联一个博客时，可以直接使用用户名。账号关联多个博客且子域名不匹配时，请使用所需博客的 Hashnode 子域名。',
};

async function findPublication(username: string) {
    const response = await ofetch<UserResponse>(apiUrl, {
        method: 'POST',
        body: {
            query: /* GraphQL */ `
                query BlogForUser($username: String!) {
                    user(username: $username) {
                        publications(first: 20) {
                            edges {
                                node {
                                    title
                                    url
                                    domainInfo {
                                        hashnodeSubdomain
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            variables: { username },
        },
    });
    const error = response.errors?.find((entry) => entry.extensions?.code !== 'NOT_FOUND');
    if (error) {
        throw new Error(`Hashnode could not resolve ${username}: ${error.message}`);
    }
    const publications = response.data?.user?.publications.edges.map(({ node }) => node) ?? [];
    const match = publications.find((publication) => publication.domainInfo?.hashnodeSubdomain?.toLowerCase() === username);
    if (match || publications.length <= 1) {
        return match ?? publications[0];
    }
    throw new InvalidParameterError(
        `Hashnode user "${username}" has multiple publications. Use the blog's hashnode.dev subdomain: ${publications
            .map((publication) => publication.domainInfo?.hashnodeSubdomain)
            .filter(Boolean)
            .join(', ')}.`
    );
}

async function handler(ctx: Context) {
    const username = ctx.req.param('username')?.toLowerCase();
    if (!username || !slugPattern.test(username)) {
        throw new InvalidParameterError('Use a Hashnode username or blog subdomain, without the domain suffix.');
    }

    const publication = await findPublication(username);
    const subdomain = publication?.domainInfo?.hashnodeSubdomain || username;
    if (!slugPattern.test(subdomain)) {
        throw new Error(`Hashnode did not return a valid blog subdomain for "${username}".`);
    }

    const oldUrl = `https://${username}.hashnode.dev`;
    const url = `https://${subdomain}.hashnode.dev`;
    const response = await ofetch.raw<string, 'text'>(`${url}/rss.xml`, { responseType: 'text', redirect: 'manual', ignoreResponseError: true });
    if (response.status === 404) {
        throw new NotFoundError(`Hashnode did not find a public blog for "${username}". Use the blog's hashnode.dev subdomain.`);
    }
    if (!response.ok || !response._data) {
        throw new Error(`Hashnode blog "${subdomain}" did not return an RSS feed (HTTP ${response.status}).`);
    }
    const feed = await parser.parseString(response._data);

    return {
        title: feed.title ?? publication?.title ?? `Hashnode by ${username}`,
        description: feed.description,
        link: feed.link ?? url,
        image: feed.image?.url,
        item: feed.items.flatMap((item) => {
            const link = item.link && URL.parse(item.link, url);
            if (!item.title || !link || !['http:', 'https:'].includes(link.protocol)) {
                return [];
            }
            const slug = link.pathname.split('/').findLast(Boolean);
            return {
                title: item.title,
                link: link.href,
                guid: slug ? `${oldUrl}/${slug}` : undefined,
                description: item['content:encoded'] ?? item.content ?? item.contentSnippet,
                author: item.creator ?? username,
                pubDate: item.isoDate ? parseDate(item.isoDate) : undefined,
                category: item.categories,
            };
        }),
    };
}
