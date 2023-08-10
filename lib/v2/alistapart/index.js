const { getData, getList } = require('./utils');

module.exports = async (ctx) => {
    const baseUrl = 'https://alistapart.com';
    const route = '/wp-json/wp/v2/article';

    const data = await getData(`${baseUrl}${route}`);
    const listItems = await getList(data);
    const items = await Promise.all(
        listItems.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const category = await getData(`https://alistapart.com/wp-json/wp/v2/categories?post=${item.id}`);
                item.category = category.map((v) => v.name);
                const author = await getData(`https://alistapart.com/wp-json/wp/v2/coauthors?post=${item.id}`);
                item.author = author.map((v) => v.name).join(', ');
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'A List Apart',
        link: `${baseUrl}/articles`,
        item: items,
        description: 'Articles on aListApart.com',
        logo: 'https://i0.wp.com/alistapart.com/wp-content/uploads/2019/03/cropped-icon_navigation-laurel-512.jpg?fit=192,192&ssl=1',
        icon: 'https://i0.wp.com/alistapart.com/wp-content/uploads/2019/03/cropped-icon_navigation-laurel-512.jpg?fit=32,32&ssl=1',
        language: 'en-us',
    };
};
