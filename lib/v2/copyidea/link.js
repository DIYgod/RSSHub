const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const token = String(ctx.params.token);

    const response = await got.post({
        url: `https://www.yinian.pro/api/link`,
        headers: {
            Referer: `https://www.yinian.pro/`,
            token: `${token}`,
        },
    });
    const { data, code, msg } = response.data;
    if (code !== 200) {
        throw new Error(msg ? msg : code);
    }

    ctx.state.data = {
        title: `你的一念便签`,
        link: `https://www.yinian.pro/`,
        description: `你的一念便签`,
        item: data.sticky.map((item) => ({
            title: item.content,
            pubDate: parseDate(item.create_at),
        })),
    };
};
