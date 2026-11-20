import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate, toISOString } from '@/utils/time';

const pacificTime = 'America/Los_Angeles';

type Post = {
    id: string;
    name: string;
    url: string;
    tagline?: string;
    description?: string;
    scheduledAt?: string;
    createdAt: string;
    user?: { name: string };
    thumbnail?: { url: string };
    topics?: { edges: Array<{ node: { name: string } }> };
};

export async function fetchFeaturedPosts(token: string): Promise<DataItem[]> {
    const today = Temporal.Now.zonedDateTimeISO(pacificTime).startOfDay();
    const after = toISOString(today.toInstant());
    const before = toISOString(today.add({ days: 1 }).startOfDay().toInstant());

    const result = await ofetch<{ data?: { posts: { edges: Array<{ node: Post }> } }; errors?: Array<{ message: string }> }>('https://api.producthunt.com/v2/api/graphql', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
            query: /* GraphQL */ `
                query FeaturedToday($after: DateTime!, $before: DateTime!) {
                    posts(first: 50, featured: true, order: RANKING, postedAfter: $after, postedBefore: $before) {
                        edges {
                            node {
                                id
                                name
                                url
                                tagline
                                description
                                createdAt
                                scheduledAt
                                user {
                                    name
                                }
                                thumbnail {
                                    url
                                }
                                topics(first: 10) {
                                    edges {
                                        node {
                                            name
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            variables: { after, before },
        },
    });
    if (result.errors?.length || !result.data?.posts?.edges) {
        throw new Error('Product Hunt did not return the featured posts. Verify the API token.');
    }
    return result.data.posts.edges.map(({ node }) => ({
        title: node.name,
        link: node.url,
        guid: node.id,
        description: node.description ?? node.tagline,
        pubDate: parseDate(node.scheduledAt ?? node.createdAt),
        author: node.user?.name,
        image: node.thumbnail?.url,
        category: node.topics?.edges.map(({ node }) => node.name),
    }));
}
