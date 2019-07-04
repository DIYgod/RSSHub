const got = require('@/utils/got');
const url = require('url');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const country = ctx.params.country;
    const id = ctx.params.id;
    const link = `https://apps.apple.com/${country}/app/${id}`;
    const target = url.resolve(link, '?mt=8#see-all/in-app-purchases');

    const res = await got.get(target);
    const $ = cheerio.load(res.data);

    const data = JSON.parse($('#shoebox-ember-data-store')[0].firstChild.data);
    const attributes = data.data.attributes;
    const titleTemp = attributes.name;
    const platform = attributes.kind === 'iosSoftware' ? 'iOS' : 'macOS';
    let title;
    let item = [];
    if (attributes.hasInAppPurchases) {
        title = `${country === 'cn' ? '内购限免提醒' : 'IAP price watcher'}: ${titleTemp} for ${platform}`;
        const list = data.included.filter((e) => e.type === 'product/app/in-app');
        item = list.map((e) => {
            const title = `${e.attributes.name} is now ${e.attributes.price}`;
            return {
                link,
                guid: title,
                title,
                pubDate: new Date(Date.now()).toUTCString(),
            };
        });
    } else {
        title = `${titleTemp} for ${platform} ${country === 'cn' ? ' 不包含内购项目' : 'has no IAP items'}`;
    }

    ctx.state.data = {
        title,
        link,
        item,
    };
};
