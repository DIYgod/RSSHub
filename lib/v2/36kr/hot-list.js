const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const CryptoJS = require('crypto-js');

const categories = {
    24: {
        title: '24小时热榜',
        regex: 'hotlist":{"code":0,"data',
    },
    renqi: {
        title: '资讯人气榜',
        regex: 'topList',
    },
    zonghe: {
        title: '资讯综合榜',
        regex: 'hotList',
    },
    shoucang: {
        title: '资讯综合榜',
        regex: 'collectList',
    },
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '24';

    const rootUrl = 'https://www.36kr.com';
    const currentUrl = category === '24' ? rootUrl : `${rootUrl}/hot-list/catalog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = JSON.parse(response.data.match(new RegExp('"' + categories[category].regex + '":(\\[.*?\\])'))[1]);

    let items = data
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30)
        .filter((item) => item.itemType !== 0)
        .map((item) => {
            item = item.templateMaterial ?? item;
            return {
                title: item.widgetTitle.replace(/<\/?em>/g, ''),
                author: item.author,
                pubDate: parseDate(item.publishTime),
                link: `${rootUrl}/p/${item.itemId}`,
                description: item.widgetContent ?? item.content,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const cipherTextList = detailResponse.data.match(/{"state":"(.*)","isEncrypt":true}/) ?? [];
                if (cipherTextList.length !== 0) {
                    const key = CryptoJS.enc.Utf8.parse('efabccee-b754-4c');
                    const content = JSON.parse(
                        CryptoJS.AES.decrypt(cipherTextList[1], key, {
                            mode: CryptoJS.mode.ECB,
                            padding: CryptoJS.pad.Pkcs7,
                        })
                            .toString(CryptoJS.enc.Utf8)
                            .toString()
                    ).articleDetail.articleDetailData.data;
                    item.description = content.widgetContent;
                } else {
                    const $ = cheerio.load(detailResponse.body);
                    item.description = $('div.articleDetailContent').html();
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `36氪 - ${categories[category].title}`,
        link: currentUrl,
        item: items,
    };
};
