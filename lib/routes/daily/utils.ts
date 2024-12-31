import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { config } from '@/config';
import { art } from '@/utils/render';
import path from 'node:path';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

export const baseUrl = 'https://app.daily.dev';
const gqlUrl = `https://api.daily.dev/graphql`;
export const variables = {
    version: 54,
    loggedIn: false,
};
const INNER_SHARED_CONTENT = Boolean(config.daily.inner_shared_content?.trim().toLowerCase() === 'true');

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
    if (source) {
        return response.data.source;
    }
    return response.data.page.edges;
};

const render = (data) => art(path.join(__dirname, 'templates/posts.art'), data);

export const getList = (edges) =>
    edges.map(({ node }) => {
        let link: string;
        let title: string;
        if (INNER_SHARED_CONTENT && node.type === 'share') {
            link = node.sharedPost.permalink;
            title = node.sharedPost.title;
        } else {
            link = node.commentsPermalink ?? node.permalink;
            title = node.title;
        }

        return {
            id: node.id,
            title,
            link,
            guid: node.permalink,
            description: render({
                image: node.image,
                content: node.contentHtml?.replaceAll('\n', '<br>') ?? node.summary,
            }),
            author: node.author?.name,
            itunes_item_image: node?.image,
            pubDate: parseDate(node.createdAt),
            upvotes: node.numUpvotes,
            comments: node.numComments,
            category: node.tags,
        };
    });
