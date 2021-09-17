const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const languageCodes = {
        en: 'en',
        zh_cn: 'sc',
        zh_tw: 'tc',
    };

    const category = ctx.params.category ?? 'important_ft';
    const language = ctx.params.language ?? 'zh_tw';

    const rootUrl = 'https://www.chp.gov.hk';
    const currentUrl = `${rootUrl}/js/${category}.js`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = JSON.parse(response.data.match(/"data":(\[\{.*\}\])\}/)[1]).map((item) => {
        let link = '';

        if (item.UrlPath_en) {
            link = item[`UrlPath_${language}`].indexOf('http') < 0 ? `${rootUrl}${item[`UrlPath_${language}`]}` : item[`UrlPath_${language}`];
        } else if (category === 'ResponseLevel' && item.FilePath_en) {
            link = item[`FilePath_${language}`].indexOf('http') < 0 ? `${rootUrl}${item[`FilePath_${language}`]}` : item[`FilePath_${language}`];
        } else {
            link = `${rootUrl}/${languageCodes[language]}/${category === 'publication' ? 'guideline' : 'features'}/${item.InfoBlockID}.html`;
        }

        return {
            link,
            pubDate: parseDate(item.PublishDate),
            description: item[`Content_${language}`] ?? '',
            title: item[`Title_${language}`]?.replace(/<.*>/, '') ?? '',
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if ((category === 'important_ft' || category === 'press_data_index') && (item.link.indexOf('htm') > 0 || item.link.indexOf('/features/') > 0)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    content('#btmNav, script').remove();
                    content('.contHeader, .title_display_date').remove();
                    content('.printBtn, .bookmarkBtn, .qrBtn, .qr-content').remove();

                    item.description = content('#mainContent, #pressrelease').html();
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '',
        link: currentUrl,
        item: items,
    };
};
