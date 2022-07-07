const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const CryptoJS = require('crypto-js');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://36kr.com';
    const currentUrl = `${rootUrl}/motif/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = JSON.parse(response.data.match(/"motifDetailData":{"code":0,"data":(.*)},"channel"/)[1]);

    let items = data.motifArticleList.data.itemList.map((item) => ({
        title: item.templateMaterial.widgetTitle,
        link: `${rootUrl}/p/${item.itemId}`,
        pubDate: parseDate(item.templateMaterial.publishTime),
    }));

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

                item.author = content.author;
                item.description = content.widgetContent;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `36kr - ${data.motifInfo.data.categoryTitle}`,
        link: currentUrl,
        item: items,
    };
};
