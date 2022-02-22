const got = require('@/utils/got');
const CryptoJS = require('crypto-js');
const password = 'gefdzfdef';

module.exports = async (ctx) => {
    const tag = ctx.params.tag ? ctx.params.tag : 'all';
    const mode = ctx.params.mode ? ctx.params.mode : 'simple';
    const limit = 'simple' === mode ? 20 : 10;

    const url = `https://girlimg.epio.app/api/articles?lang=en-us&filter={"where":{"tag":"${tag}","lang":"en-us"},"limit":20,"skip":0}`;

    const index_json = await fetchUrl(url);

    const items = await Promise.all(
        index_json.slice(0, limit).map(async (item) => {
            const simple = {
                title: item.title,
                link: `https://girlimg.epio.app/article/detail/${item._id}`,
                pubDate: new Date(item.release_date).toUTCString(),
            };
            let details;
            if ('simple' === mode) {
                details = {
                    description: item.cover,
                };
            } else {
                details = await ctx.cache.tryGet(item._id, async () => {
                    const data = await fetchUrl(`https://girlimg.epio.app/api/articles/${item._id}?lang=en-us`);
                    return {
                        description: data.content,
                    };
                });
            }
            return Promise.resolve(Object.assign({}, simple, details));
        })
    );
    ctx.state.data = {
        title: 'girlimg - album',
        link: `https://girlimg.epio.app`,
        item: items,
    };
};

async function fetchUrl(url) {
    const encrypt_json = (
        await got({
            method: 'get',
            url,
            headers: {
                Referer: 'https://girlimg.epio.app/',
            },
        })
    ).data;

    const bytes = CryptoJS.AES.decrypt(encrypt_json.string, password);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
