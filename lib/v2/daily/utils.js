const dayjs = require('dayjs');
const got = require('@/utils/got');

const getData = async (graphqlQuery) =>
    (
        await got
            .post('https://app.daily.dev/api/graphql', {
                json: graphqlQuery,
            })
            .json()
    ).data.page.edges;

const getList = (data) =>
    data.map((value) => {
        const { id, title, image, permalink, summary, createdAt, numUpvotes, author, tags, numComments } = value.node;
        const pubDate = dayjs(createdAt);
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
        data.map(async (v) => {
            const resp = await got(v.link);
            return { ...v, link: resp.headers.link.split(/[<>]/g)[1] };
        })
    );

module.exports = { getData, getList, getRedirectedLink };
