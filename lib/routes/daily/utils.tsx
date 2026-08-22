import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface SharedPost {
    title: string;
    summary?: string;
    image?: string;
    permalink: string;
}

interface FeedPost extends SharedPost {
    id: string;
    type: string;
    commentsPermalink?: string;
    createdAt: string;
    numUpvotes?: number;
    numComments?: number;
    author?: { name: string };
    tags?: string[];
    contentHtml?: string;
    sharedPost: SharedPost;
}

export interface FeedEdge {
    node: FeedPost;
}

export const baseUrl = 'https://app.daily.dev';
const gqlUrl = 'https://api.daily.dev/graphql';
export const variables = {
    version: 54,
    loggedIn: false,
};
export const getBuildId = () =>
    cache.tryGet(
        'daily:buildId',
        async () => {
            const response = await ofetch(`${baseUrl}/onboarding`);
            const buildId = response.match(/"buildId":"(.*?)"/)[1];
            return buildId;
        },
        config.cache.routeExpire,
        false
    );

export const getData = async (graphqlQuery, source = false) => {
    const response = await ofetch(gqlUrl, {
        method: 'POST',
        body: graphqlQuery,
    });
    return source ? response.data.source : response.data.page.edges;
};

const render = ({ image, content }: { image?: string; content?: string }) =>
    renderToString(
        <>
            {image ? (
                <>
                    <img src={image} />
                    <br />
                </>
            ) : null}
            {content ? raw(content) : null}
        </>
    );

export const getList = (edges: FeedEdge[], dateSort: boolean): DataItem[] =>
    edges.map(({ node }) => {
        const post = node.type === 'share' ? node.sharedPost : node;

        return {
            id: node.id,
            title: post.title,
            link: node.commentsPermalink ?? node.permalink,
            guid: node.permalink,
            description: render({
                image: post.image?.includes('/public/Placeholder') ? undefined : post.image,
                content: node.contentHtml?.replaceAll('\n', '<br>') ?? post.summary,
            }),
            author: node.author?.name,
            itunes_item_image: post.image,
            pubDate: dateSort ? parseDate(node.createdAt) : '',
            upvotes: node.numUpvotes,
            comments: node.numComments,
            category: node.tags,
        };
    });
