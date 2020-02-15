const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const tag = ctx.params.tag;

    const response = await got({
        method: 'get',
        url: `https://www.instagram.com/explore/tags/${tag}/`,
        headers: {
            Referer: `https://www.instagram.com/explore/tags/${tag}/`,
        },
    });

    const data = JSON.parse(response.data.match(/<script type="text\/javascript">window._sharedData = (.*);<\/script>/)[1]) || {};
    const list = data.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges;

    const $ = cheerio.load(response.data);

    // retrieve media objects
    const media = await Promise.all(
        list.map(async (item) => {
            item = item.node;

            const url = `https://www.instagram.com/p/${item.shortcode}`;
            const cache = await ctx.cache.get(url);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            if (item.__typename === 'GraphImage') {
                const single = {
                    image: item.display_url,
                };

                ctx.cache.set(url, JSON.stringify([single]));
                return Promise.resolve([single]);
            } else if (item.__typename === 'GraphSidecar') {
                const response = await got({
                    method: 'get',
                    url,
                });
                const data = JSON.parse(response.data.match(/<script type="text\/javascript">window._sharedData = (.*);<\/script>/)[1]) || {};
                const single = data.entry_data.PostPage[0].graphql.shortcode_media.edge_sidecar_to_children.edges.map((item) => ({
                    image: item.node.display_url,
                    video: item.node.video_url,
                }));

                ctx.cache.set(url, JSON.stringify(single));
                return Promise.resolve(single);
            } else if (item.__typename === 'GraphVideo') {
                const response = await got({
                    method: 'get',
                    url,
                });
                const data = JSON.parse(response.data.match(/<script type="text\/javascript">window._sharedData = (.*);<\/script>/)[1]) || {};
                const single = {
                    image: data.entry_data.PostPage[0].graphql.shortcode_media.display_url,
                    video: data.entry_data.PostPage[0].graphql.shortcode_media.video_url,
                };

                ctx.cache.set(url, JSON.stringify([single]));
                return Promise.resolve([single]);
            }
        })
    );

    ctx.state.data = {
        title: `#${tag} hashtag on Instagram`,
        link: `https://www.instagram.com/explore/tags/${tag}/`,
        description: $('meta[name="description"]').attr('content'),
        item: list.map((item, index) => {
            item = item.node;
            let image = 0;
            let video = 0;

            let content = '';

            for (let i = 0; i < media[index].length; i++) {
                if (media[index][i].image && !media[index][i].video) {
                    content += `<img src="${media[index][i].image}"><br>`;
                    image++;
                }

                if (media[index][i].video) {
                    content += `<video width="100%" controls="controls" poster="${media[index][i].image}"> <source src="${media[index][i].video}" type="video/mp4"> Your RSS reader does not support video playback. </video>`;
                    video++;
                }
            }

            let title = (item.edge_media_to_caption.edges && item.edge_media_to_caption.edges[0] && item.edge_media_to_caption.edges[0].node.text) || '无题/Untitled';

            if (image > 1) {
                title = `[组图/Carousel]${title}`;
            }

            if (video > 0) {
                title = `[视频/Video]${title}`;
            }

            return {
                title: `${title}`,
                description: `${title}<br>${content}`,
                pubDate: new Date(item.taken_at_timestamp * 1000).toUTCString(),
                link: `https://www.instagram.com/p/${item.shortcode}/`,
            };
        }),
    };
};
