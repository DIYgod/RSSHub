const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const language = ctx.params.language ?? 'zh';

    const rootUrl = 'https://panewslab.com';
    const apiUrl = `${rootUrl}/api/sqtopic/pageBy`;
    const currentUrl = `${rootUrl}/${language}/news/index.html`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        form: {
            language,
            pageIndex: 1,
            pageSize: 50,
            topicState: 'PUBLISHED',
        },
    });

    const items = response.data.data.list[0].data.map((item) => ({
        title: item.title,
        author: item.nick_name,
        pubDate: parseDate(item.create_time),
        link: `${rootUrl}/${language}/sqarticledetails/${item.id}.html`,
        description: `<p>${item.content.replace(/来源链接$/, '').replace(/原文链接$/, '')}</p>`,
    }));

    ctx.state.data = {
        title: 'PANews - 快讯',
        link: currentUrl,
        item: items,
    };
};
