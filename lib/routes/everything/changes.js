const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.voidtools.com/Changes.txt';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const items = response.data
        .replace(/\t\n\n|\t\n/g, '\n\n')
        .split('\n\n')
        .map((item) => {
            item = item.indexOf('\n') === 0 ? item.substr(2, item.length - 2) : item;

            const title = item.split('\n')[0].split(':');
            const description = `<ul>${item.split(title[1])[1].replace(/\t/g, '<li>').replace(/\n/g, '</li>')}</ul>`;

            return {
                description,
                link: rootUrl,
                title: title[1],
                pubDate: new Date(title[0]).toUTCString(),
            };
        });

    ctx.state.data = {
        title: 'Everything - Changes',
        link: rootUrl,
        item: items,
    };
};
