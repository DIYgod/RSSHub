import got from '~/utils/got.js';

export default async (ctx) => {
    const {
        id
    } = ctx.params;

    const url = `https://cowlevel.net/element/${id}/article`;

    const response = await got({
        method: 'get',
        url: `https://cowlevel.net/search/article-search?tag_id=${id}&game_url_slug=&per_page=10&page=1&q=&sort=&sort_type=desc&is_rich_content=1&url_slug=`,
        headers: {
            Referer: url,
        },
    });

    const element_name = response.data.data.aggs.tags[0].tag.name;
    const {
        list
    } = response.data.data;

    ctx.state.data = {
        title: `奶牛关 - ${element_name}`,
        link: url,
        item: list.map((item) => ({
            title: item.title,
            author: item.user.name,
            description: item.content,
            pubDate: new Date(item.update_time * 1000),
            link: `https://cowlevel.net/article/${item.id}`,
        })),
    };
};
