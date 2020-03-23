const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    let link = 'https://www.dwnews.com';
    const api = 'https://prod-site-api.dwnews.com/v2/articles';
    let region,
        regionid,
        host,
        title = '要闻';

    if (ctx.params.region) {
        region = ctx.params.region.toLowerCase();
        switch (region) {
            case 'china':
                title = `中国${title}`;
                regionid = '10000117';
                break;
            case 'global':
                title = `国际${title}`;
                regionid = '10000118';
                break;
            case 'hongkong':
                title = `香港${title}`;
                regionid = '10000120';
                break;
            case 'taiwan':
                title = `台湾${title}`;
                regionid = '10000119';
                break;
            case 'jingji':
                title = `经济${title}`;
                regionid = '10000123';
                break;
            case 'shijue':
                title = `视觉${title}`;
                regionid = '10000153';
                break;
            default:
                throw 'Unknown region';
        }
        host = `https://prod-site-api.dwnews.com/v2/feed/zone/${regionid}?offset=99999999994&bucketId=00000`;
        link = `${link}/zone/${regionid}`;
    } else {
        host = 'https://prod-site-api.dwnews.com/v2/feed/home/?offset=9999999999&bucketId=00000';
    }

    const list = await got.get(host);

    const out = await Promise.all(
        list.data.items.map(async (item) => {
            const url = `${api}/${item.id}`;
            const cache = await ctx.cache.get(url);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(url);

            const single = utils.ProcessFeed(response.data);

            ctx.cache.set(url, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `多维新闻网 - ${title}`,
        description: '多维新闻网—记住世界的轨迹 更需多维的视线，海外华人首选的中文门户新闻网站，及时全面的向全球海外华人更新世界各地时事政治、经济、科技、人文历史、图片、视频等新闻内容，是海外华人必上的新闻门户网站。',
        link,
        item: out,
    };
};
