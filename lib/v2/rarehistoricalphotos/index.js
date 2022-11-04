const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://rarehistoricalphotos.com';

module.exports = async (ctx) => {
    const { data } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.query.limit ? Number(ctx.query.limit) : undefined,
        },
    });

    const items = data.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        link: item.link,
        pubDate: parseDate(item.date_gmt),
    }));

    ctx.state.data = {
        title: 'Rare Historical Photos',
        description: 'And the story behind them...',
        link: baseUrl,
        image: 'https://rarehistoricalphotos.com/wp-content/uploads/2022/04/cropped-rarehistoricalphotos-32x32.png',
        language: 'en-US',
        item: items,
    };
};
