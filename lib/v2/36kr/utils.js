const got = require('@/utils/got');
const cheerio = require('cheerio');
const CryptoJS = require('crypto-js');

const rootUrl = 'https://www.36kr.com';

module.exports = {
    rootUrl,
    ProcessItem: (item, tryGet) =>
        tryGet(item.link, async () => {
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
        }),
};
