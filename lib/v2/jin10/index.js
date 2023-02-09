const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const { important = false } = ctx.params;
    const data = await ctx.cache.tryGet(
        'jin10:index',
        async () => {
            const { data: response } = await got('https://flash-api.jin10.com/get_flash_list', {
                headers: {
                    'x-app-id': 'bVBF4FyRTn5NJF5n',
                    'x-version': '1.0.0',
                },
                searchParams: {
                    channel: '-8200',
                    vip: '1',
                },
            });
            return response.data.filter((item) => item.type !== 1);
        },
        config.cache.routeExpire,
        false
    );

    const item = data.map((item) => {
        const titleMatch = item.data.content.match(/^【(.*?)】/);
        let title;
        let content = item.data.content;
        if (titleMatch) {
            title = titleMatch[1];
            content = content.replace(titleMatch[0], '');
        } else {
            title = item.data.vip_title || item.data.content;
        }

        return {
            title,
            description: art(path.join(__dirname, 'templates/description.art'), {
                content,
                pic: item.data.pic,
            }),
            pubDate: timezone(parseDate(item.time), 8),
            link: item.data.link,
            guid: `jin10:index:${item.id}`,
            important: item.important,
        };
    });

    ctx.state.data = {
        title: '金十数据',
        link: 'https://www.jin10.com/',
        item: important ? item.filter((item) => item.important) : item,
    };
};
