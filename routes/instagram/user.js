const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://www.instagram.com/${id}/`,
        headers: {
            Referer: `https://www.instagram.com/${id}/`,
        },
    });

    const data = JSON.parse(response.data.match(/<script type="text\/javascript">window._sharedData = (.*);<\/script>/)[1]) || {};
    const list = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
    const name = data.entry_data.ProfilePage[0].graphql.user.full_name;

    const $ = cheerio.load(response.data);

    // 获取组图
    const images = await Promise.all(
        list.map(async (item) => {
            item = item.node;
            if (item.__typename === 'GraphSidecar') {
                const url = `https://www.instagram.com/p/${item.shortcode}`;

                const cache = await ctx.cache.get(url);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }
                const response = await axios({
                    method: 'get',
                    url,
                });
                const data = JSON.parse(response.data.match(/<script type="text\/javascript">window._sharedData = (.*);<\/script>/)[1]) || {};
                const single = data.entry_data.PostPage[0].graphql.shortcode_media.edge_sidecar_to_children.edges.map((item) => item.node.display_url);

                ctx.cache.set(url, JSON.stringify(single), 24 * 60 * 60);
                return Promise.resolve(single);
            } else {
                return Promise.resolve([item.display_url]);
            }
        })
    );

    ctx.state.data = {
        title: `${name}(@${id})'s Instagram`,
        link: `https://www.instagram.com/${id}/`,
        description: $('meta[name="description"]').attr('content'),
        item: list.map((item, index) => {
            item = item.node;
            let type = '';
            let tip = '';
            switch (item.__typename) {
                case 'GraphVideo':
                    type = '[视频/Video] ';
                    tip = '打开原文播放视频/click to play the video: ';
                    break;
                case 'GraphSidecar':
                    type = '[组图/Carousel] ';
                    break;
            }
            let imgTPL = '';
            for (let i = 0; i < images[index].length; i++) {
                imgTPL += `<img referrerpolicy="no-referrer" src="${images[index][i]}"><br>`;
            }
            const title = (item.edge_media_to_caption.edges && item.edge_media_to_caption.edges[0] && item.edge_media_to_caption.edges[0].node.text) || '无题/Untitled';
            return {
                title: `${type}${title}`,
                description: `${title}<br>${tip}${imgTPL}`,
                pubDate: new Date(item.taken_at_timestamp * 1000).toUTCString(),
                link: `https://www.instagram.com/p/${item.shortcode}/`,
            };
        }),
    };
};
