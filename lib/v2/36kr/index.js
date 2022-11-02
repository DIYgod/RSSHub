const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const CryptoJS = require('crypto-js');
const querystring = require("querystring");

const shortcuts = {
    '/information': '/information/web_news',
    '/information/latest': '/information/web_news',
    '/information/recommend': '/information/web_recommend',
    '/information/life': '/information/happy_life',
    '/information/estate': '/information/real_estate',
    '/information/workplace': '/information/web_zhichang',
};

module.exports = async (ctx) => {
    const path = ctx.path.replace(/^\/news(?!flashes)/, '/information').replace(/\/search\/article/, '/search/articles');

    const rootUrl = 'https://www.36kr.com';
    const currentUrl = `${rootUrl}${shortcuts.hasOwnProperty(path) ? shortcuts[path] : path}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const data = JSON.parse(response.data.match(/"itemList":(\[.*?\])/)[1]);

    let items = data.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30).map((item) => {
        let itemType = item.itemType;
        item = item.templateMaterial ?? item;
        if (itemType === 0) {
            // itemType === 0 is ads, if dont want ads, just skip it.
            // maybe we could set a switch like `ads=false` to control it?
            // if (!showAds) { continue; }

            // for now, we just continue to parse it.
            item = JSON.parse(item.adJsonContent);
            return {
                title: item.title.replace(/<\/?em>/g, ''),
                author: '36kr',
                pubDate: parseDate(Date.now()),
                link: decodeURIComponent(atob(querystring.parse(item.href)['param.redirectUrl'])
                    .split('').map(c => `%${
                        ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                    }`).join('')),
                description: item.description,
            }
        }
        return {
            title: item.widgetTitle.replace(/<\/?em>/g, ''),
            author: item.author,
            pubDate: parseDate(item.publishTime),
            link: `${rootUrl}/${path === '/newsflashes' ? 'newsflashes' : 'p'}/${item.itemId}`,
            description: item.widgetContent ?? item.content,
        };
    });

    if (!/^\/(search|newsflashes)/.test(path)) {
        items = await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const key = CryptoJS.enc.Utf8.parse('efabccee-b754-4c');
                    const cipherText = detailResponse.data.match(/{"state":"(.*)","isEncrypt":true}/)[1];

                    const content = JSON.parse(
                        CryptoJS.AES.decrypt(cipherText, key, {
                            mode: CryptoJS.mode.ECB,
                            padding: CryptoJS.pad.Pkcs7,
                        })
                            .toString(CryptoJS.enc.Utf8)
                            .toString()
                    ).articleDetail.articleDetailData.data;

                    item.description = content.widgetContent;

                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title: `36氪 - ${$('title').text().split('_')[0]}`,
        link: currentUrl,
        item: items,
    };
};
