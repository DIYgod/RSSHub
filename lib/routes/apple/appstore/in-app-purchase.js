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
    const lang = $('html').attr('lang');

    const apiResponse = (
        await got({
            method: 'get',
            url: `https://amp-api.apps.apple.com/v1/catalog/${country}/apps/${id.replace(
                'id',
                ''
            )}?platform=web&additionalPlatforms=appletv%2Cipad%2Ciphone%2Cmac&extend=description%2CdeveloperInfo%2CeditorialVideo%2Ceula%2CfileSizeByDevice%2CmessagesScreenshots%2CprivacyPolicyUrl%2CprivacyPolicyText%2CpromotionalText%2CscreenshotsByType%2CsupportURLForLanguage%2CversionHistory%2CvideoPreviewsByType%2CwebsiteUrl&include=genres%2Cdeveloper%2Creviews%2Cmerchandised-in-apps%2Ccustomers-also-bought-apps%2Cdeveloper-other-apps%2Capp-bundles%2Ctop-in-apps%2Ceula&l=${lang}`,
            headers: {
                authorization:
                    'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IldlYlBsYXlLaWQifQ.eyJpc3MiOiJBTVBXZWJQbGF5IiwiaWF0IjoxNTc0MTk3NDA3LCJleHAiOjE1ODk3NDk0MDd9.ael_GP97O4fyXJuQAQlmC7ieY-t-OOGFwtXShhVA6m_p9Sq03D-_FiUKSfZ2iXGob3vPFnDe0s_OKI3Tg7KVaA',
                authority: 'amp-api.apps.apple.com',
                referer: target,
            },
        })
    ).data.data[0];

    const attributes = apiResponse.attributes;
    const titleTemp = attributes.name;

    const platform = attributes.deviceFamilies.includes('mac') ? 'macOS' : 'iOS';
    let title;
    let item = [];

    const iap = apiResponse.relationships['top-in-apps'].data;
    if (iap) {
        title = `${country === 'cn' ? '内购限免提醒' : 'IAP price watcher'}: ${titleTemp} for ${platform}`;

        item = iap.map((e) => {
            const title = `${e.attributes.name} is now ${e.attributes.offers[0].priceFormatted}`;

            const result = {
                link,
                guid: e.attributes.url,
                description: e.attributes.artwork ? e.attributes.description.standard + `<br><img src=${e.attributes.artwork.url.replace('{w}x{h}{c}.{f}', '320x0w.jpg')}>` : e.attributes.description.standard,
                title,
                pubDate: new Date().toUTCString(),
            };
            return result;
        });
    }

    ctx.state.data = {
        title,
        link,
        item,
    };
};
