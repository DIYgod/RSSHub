// @ts-nocheck
const { getData, getList } = require('./utils');

export default async (ctx) => {
    const baseUrl = 'https://grist.org';
    const route = '/wp-json/wp/v2/posts?_embed';

    const data = await getData(`${baseUrl}${route}`);
    const items = await getList(data);

    ctx.set('data', {
        title: 'Gist Latest Articles',
        link: `${baseUrl}/articles`,
        item: items,
        description: 'Latest Articles on grist.org',
        logo: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=192',
        icon: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=32',
        language: 'en-us',
    });
};
