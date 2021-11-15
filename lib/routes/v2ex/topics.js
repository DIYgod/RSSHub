import got from '~/utils/got.js';

export default async (ctx) => {
    const {
        type
    } = ctx.params;

    const {
        data
    } = await got({
        method: 'get',
        url: `https://www.v2ex.com/api/topics/${type}.json`,
    });

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
        item: data.map((item) => ({
            title: item.title,
            description: `${item.member.username}: ${item.content_rendered}`,
            content: { text: item.content, html: item.content_rendered },
            pubDate: new Date(item.created * 1000).toUTCString(),
            guid: item.id,
            link: item.url,
            author: item.member.username,
        })),
    };
};
