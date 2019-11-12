const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'post',
        url: 'https://web-api.juejin.im/graphql',
        json: true,
        data: { operationName: '', query: '', variables: { size: 20, after: '', afterPosition: '' }, extensions: { query: { id: '964dab26a3f9997283d173b865509890' } } },
        headers: {
            'X-Agent': 'Juejin/Web',
        },
    });

    const items = response.data.data.recommendedActivityFeed.items.edges.map(
        ({
            node: {
                targets: [item],
            },
        }) => {
            const content = item.content;
            const title = content;
            const guid = item.id;
            const link = `https://juejin.im/pin/${guid}`;
            const pubDate = new Date(item.createdAt).toUTCString();
            const author = item.user.username;
            const imgs = item.pictures.reduce((imgs, item) => {
                imgs += `
          <img src="${item}"><br>
        `;
                return imgs;
            }, '');
            const url = item.url;
            const urlTitle = item.urlTitle;
            const description = `
            ${content.replace(/\n/g, '<br>')}<br>
            ${imgs}<br>
            <a href="${url}">${urlTitle}</a><br>
        `;

            return {
                title,
                link,
                description,
                guid,
                pubDate,
                author,
            };
        }
    );

    ctx.state.data = {
        title: '沸点 - 动态',
        link: 'https://juejin.im/activities/recommended',
        item: items,
    };
};
