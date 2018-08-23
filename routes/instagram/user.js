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

    ctx.state.data = {
        title: `${name}(@${id}) 的 Instagram`,
        link: `https://www.instagram.com/${id}/`,
        description: $('meta[name="description"]').attr('content'),
        item: list.map((item) => {
            item = item.node;
            let type = '';
            let tip = '';
            switch (item.__typename) {
                case 'GraphVideo':
                    type = '[视频] ';
                    tip = '打开原文播放视频: ';
                    break;
                case 'GraphSidecar':
                    type = '[组图] ';
                    tip = '打开原文查看组图: ';
                    break;
            }
            return {
                title: `${type}${(item.edge_media_to_caption.edges && item.edge_media_to_caption.edges[0] && item.edge_media_to_caption.edges[0].node.text) || '无题'}`,
                description: `${tip}<img referrerpolicy="no-referrer" src="${item.display_url}">`,
                pubDate: new Date(item.taken_at_timestamp * 1000).toUTCString(),
                link: `https://www.instagram.com/p/${item.shortcode}/`,
            };
        }),
    };
};
