const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://addons.mozilla.org/zh-CN/firefox/addon/${id}/versions/`,
    });
    const data = JSON.parse(cheerio.load(response.data)('#redux-store-state').text());
    const info = data.addons.byID[data.addons.bySlug[id]];
    const versionIds = data.versions.bySlug[id].versionIds;

    ctx.state.data = {
        title: `${info.name} 附加组件更新 - Firefox`,
        description: info.summary || info.description,
        link: `https://addons.mozilla.org/zh-CN/firefox/addon/${id}/versions/`,
        item:
            versionIds &&
            versionIds.map((versionId) => {
                const versionInfo = data.versions.byId[versionId];
                const version = 'v' + versionInfo.version;
                return {
                    title: version,
                    description: versionInfo.releaseNotes || '',
                    link: `https://addons.mozilla.org/zh-CN/firefox/addon/${id}/versions/`,
                    pubDate: new Date(versionInfo.file.created),
                    guid: version,
                    author: info.authors.map((author) => author.name).join(', '),
                    category: info.categories,
                };
            }),
    };
};
