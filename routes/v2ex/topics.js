const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const response = await axios({
        method: 'get',
        url: `https://www.v2ex.com/api/topics/${type}.json`,
        headers: {
            'User-Agent': config.ua,
        },
    });

    const data = response.data;

    let title;
    if (type === 'hot') {
        title = '最热主题';
    } else if (type === 'latest') {
        title = '最新主题';
    }

    ctx.state.data = {
        title: `V2EX-${title}`,
        link: 'https://www.v2ex.com/',
        description: `V2EX-${title}`,
        item: data.map((item) => {
            return {
                title: item.title,
                description: item.content,
                content: item.content,
                content_rendered: item.content_rendered,
                pubDate: new Date(item.created * 1000).toUTCString(),
                guid: item.id,
                link: item.url,
            };
        }),
    };
};
