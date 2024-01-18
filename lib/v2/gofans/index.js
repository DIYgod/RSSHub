const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { kind = '' } = ctx.params;
    const baseUrl = 'https://gofans.cn';

    const { data: response } = await got('https://api.gofans.cn/v1/web/app_records', {
        headers: {
            origin: baseUrl,
        },
        searchParams: {
            limit: 20,
            kind: kind && (kind === 'macos' ? 1 : 2),
            page: 1,
        },
    });

    const items = response.data.map((item) => ({
        title: `「${item.price === '0.00' ? '免费' : '降价'}」-「${item.kind === 1 ? 'macOS' : 'iOS'}」${item.name}`,
        description: art(path.join(__dirname, 'templates/description.art'), {
            icon: item.icon,
            originalPrice: item.original_price,
            price: item.price,
            kind: item.kind,
            description: item.description.replaceAll('\n', '<br>'),
        }),
        pubDate: parseDate(item.updated_at, 'X'),
        link: new URL(`/app/${item.uuid}`, baseUrl).href,
        category: item.primary_genre_name,
    }));

    ctx.state.data = {
        title: '最新限免 / 促销应用',
        link: baseUrl,
        description: 'GoFans：最新限免 / 促销应用',
        item: items,
    };
};
