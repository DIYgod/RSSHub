// @ts-nocheck
const { getData, getList } = require('./utils');

export default async (ctx) => {
    const baseUrl = 'https://alistapart.com';
    const route = '/wp-json/wp/v2/article?_embed';

    const data = await getData(`${baseUrl}${route}`);
    const items = await getList(data);

    ctx.set('data', {
        title: 'A List Apart',
        link: `${baseUrl}/articles`,
        item: items,
        description: 'Articles on aListApart.com',
        logo: 'https://i0.wp.com/alistapart.com/wp-content/uploads/2019/03/cropped-icon_navigation-laurel-512.jpg?fit=192,192&ssl=1',
        icon: 'https://i0.wp.com/alistapart.com/wp-content/uploads/2019/03/cropped-icon_navigation-laurel-512.jpg?fit=32,32&ssl=1',
        language: 'en-us',
    });
};
