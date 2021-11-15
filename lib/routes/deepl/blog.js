import got from '~/utils/got.js';

export default async (ctx) => {
    const {
        lang = 'en'
    } = ctx.params;

    const rootUrl = 'https://www.deepl.com';
    const currentUrl = `${rootUrl}/zh/blog`;
    const blogUrl = `${rootUrl}/gatsby/locales/${lang}/blog.json`;
    const response = await got({
        method: 'get',
        url: blogUrl,
    });

    const items = [];
    const {
        data
    } = response;
    for (const key in data) {
        const matches = key.match(/post_content_(\d{8})/);
        if (matches) {
            const date = matches[1];
            items.push({
                description: data[key],
                link: `${currentUrl}/${date}`,
                title: data['post_title_' + date],
                pubDate: new Date(`${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6, 2)}`).toUTCString(),
            });
        }
    }

    ctx.state.data = {
        title: response.data.title,
        link: currentUrl,
        item: items,
    };
};
