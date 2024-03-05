// @ts-nocheck
const { getData, getList } = require('./utils');

export default async (ctx) => {
    const baseUrl = 'https://grist.org';
    const searchRoute = '/wp-json/wp/v2/categories?slug=';
    const articleRoute = '/wp-json/wp/v2/posts?categories=';
    const topic = ctx.req.param('topic');
    const id = (await getData(`${baseUrl}${searchRoute}${topic}`))[0].id;
    const data = await getData(`${baseUrl}${articleRoute}${id}&_embed`);
    const items = await getList(data);

    ctx.set('data', {
        title: `${topic[0].toUpperCase() + topic.slice(1)} - Gist Articles`,
        link: `${baseUrl}/${topic}`,
        item: items,
        description: `${topic[0].toUpperCase() + topic.slice(1)} Articles on grist.org`,
        logo: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=192',
        icon: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=32',
        language: 'en-us',
    });
};
