const dayjs = require('dayjs');

const getList = (data) => data.map((value) => {
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

const getRedirectedLink = async (data) => Promise.all(
        data.map(async (v) => {
            const resp = await fetch(v.link, {
                method: 'GET',
            });
            return { ...v, link: resp.url };
        })
    );
module.exports = { getList, getRedirectedLink };
