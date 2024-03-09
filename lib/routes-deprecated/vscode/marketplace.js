const got = require('got');
const url = require('url');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'featured';
    const category = {
        featured: { id: 0, section: 'Featured' },
        trending: { id: 1, section: 'Trending Weekly' },
        trending_w: { id: 1, section: 'Trending Weekly' },
        trending_d: { id: 2, section: 'Trending Daily' },
        trending_m: { id: 3, section: 'Trending Monthly' },
        popular: { id: 4, section: 'Most Popular' },
        new: { id: 5, section: 'Recently Added' },
    };

    const rootLink = 'https://marketplace.visualstudio.com/';
    const response = await got('https://marketplace.visualstudio.com/getextensionspercategory?Product=vscode&RemoveFirstSetCategories=true');
    const jsonData = JSON.parse(response.body);
    const extensionsList = jsonData.epc[category[type].id].e;
    const out =
        extensionsList &&
        extensionsList.map((item) => {
            const title = item.t;
            const description = item.s;
            const link = url.resolve(rootLink, item.l);
            const author = item.a;
            return {
                title,
                description,
                link,
                author,
            };
        });
    ctx.state.data = {
        title: 'VS Code Extensions: ' + category[type].section,
        link: 'https://marketplace.visualstudio.com/',
        item: out,
    };
};
