// @ts-nocheck
const { getData, getList } = require('./utils');

export default async (ctx) => {
    const baseUrl = 'https://alistapart.com';
    const searchRoute = '/wp-json/wp/v2/categories?slug=';
    const articleRoute = '/wp-json/wp/v2/article?categories=';
    const topic = ctx.req.param('topic');
    const id = (await getData(`${baseUrl}${searchRoute}${topic}`))[0]?.id;
    const data = await getData(`${baseUrl}${articleRoute}${id}&_embed`);
    const items = await getList(data);

    ctx.set('data', {
        title: 'A List Apart',
        link: `${baseUrl}/blog/topic/${topic}`,
        item: items,
        description: `${topic[0].toUpperCase() + topic.slice(1)} Articles on aListApart.com`,
        logo: 'https://i0.wp.com/alistapart.com/wp-content/uploads/2019/03/cropped-icon_navigation-laurel-512.jpg?fit=192,192&ssl=1',
        icon: 'https://i0.wp.com/alistapart.com/wp-content/uploads/2019/03/cropped-icon_navigation-laurel-512.jpg?fit=32,32&ssl=1',
        language: 'en-us',
    });
};
