const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { language = 'zh-CN' } = ctx.params;
    const current = new Date();
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const link = `https://www.google.com/doodles?hl=${language}`;

    const { data } = await got({
        method: 'get',
        url: `https://www.google.com/doodles/json/${year}/${month}?hl=${language}`,
        headers: {
            Referer: link,
        },
    });

    ctx.state.data = {
        title: 'Google Doodles',
        link,
        item:
            data &&
            data.map((item) => {
                const date = `${item.run_date_array[0]}-${item.run_date_array[1]}-${item.run_date_array[2]}`;

                return {
                    title: item.title,
                    description: `<img src="https:${item.url}" /><br>${item.share_text}`,
                    pubDate: new Date(date).toUTCString(),
                    guid: item.url,
                    link: `https://www.google.com/search?q=${encodeURIComponent(item.query)}`,
                };
            }),
    };
};
