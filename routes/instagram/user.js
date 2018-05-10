const axios = require('axios');
const cheerio = require('cheerio');
const template = require('../../utils/template');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://www.instagram.com/${id}/`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://www.instagram.com/${id}/`
        }
    });

    const data = JSON.parse(response.data.match(/<script type="text\/javascript">window._sharedData = (.*);<\/script>/)[1]) || {};
    const list = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
    const name = data.entry_data.ProfilePage[0].graphql.user.full_name;

    const $ = cheerio.load(response.data);

    ctx.body = template({
        title: `${name}(@${id}) 的 Instagram`,
        link: `https://www.instagram.com/${id}/`,
        description: $('meta[name="description"]').attr('content'),
        item: list.map((item) => {
            item = item.node;
            return {
                title: item.edge_media_to_caption.edges && item.edge_media_to_caption.edges[0] && item.edge_media_to_caption.edges[0].node.text || '无题',
                description: `${item.__typename === 'GraphVideo' ? '打开原文播放视频：' : ''}<img referrerpolicy="no-referrer" src="${item.thumbnail_src}">`,
                pubDate: new Date(item.taken_at_timestamp * 1000).toUTCString(),
                link: `https://www.instagram.com/p/${item.shortcode}/`
            };
        }),
    });
};