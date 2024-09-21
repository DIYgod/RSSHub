import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { config } from '@/config';

const baseUrl = 'https://app.daily.dev';

const getBuildId = () =>
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

const getData = async (graphqlQuery) => {
    const response = await ofetch(`${baseUrl}/api/graphql`, {
        method: 'POST',
        body: graphqlQuery,
    });
    return response.data.page.edges;
};

const getList = (data) =>
    data.map((value) => {
        const { id, title, image, permalink, summary, createdAt, numUpvotes, author, tags, numComments } = value.node;
        const pubDate = parseDate(createdAt);
        return {
            id,
            title,
            link: permalink,
            description: summary,
            author: author?.name,
            itunes_item_image: image,
            pubDate,
            upvotes: numUpvotes,
            comments: numComments,
            category: tags,
        };
    });

const getRedirectedLink = (data) =>
    Promise.all(
        data.map((v) =>
            cache.tryGet(v.link, async () => {
                const resp = await ofetch.raw(v.link);
                return { ...v, link: resp.headers.get('location') };
            })
        )
    );

export { baseUrl, getBuildId, getData, getList, getRedirectedLink };
