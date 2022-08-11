const got = require('@/utils/got');
const md = require('markdown-it')({
    html: true,
});

module.exports = async (ctx) => {
    const rootUrl = 'https://www.postman.com';
    const apiUrl = `${rootUrl}/mkapi/release.json`;
    const currentUrl = `${rootUrl}/downloads/release-notes`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.notes.map((item) => ({
        title: item.version,
        link: `${currentUrl}#${item.version}`,
        description: md.render(item.content),
    }));

    ctx.state.data = {
        title: 'Release Notes | Postman',
        link: currentUrl,
        item: items,
    };
};
