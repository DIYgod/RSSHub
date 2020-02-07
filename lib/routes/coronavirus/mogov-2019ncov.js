const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const language = ctx.params.lang.toLowerCase();

    const dataUrl = `https://www.ssm.gov.mo/apps1/apps/webpage2020/wpg/gcsnewssc_body.aspx`;

    const dateTextMapping = {
        ch: '日期 : ',
        pt: 'Date : ',
        en: 'Date : ',
    };

    const response = await got({
        method: 'post',
        url: dataUrl,
        form: {
            pg: '0',
            lang: language,
        },
    });
    const $ = cheerio.load(response.data);
    const items = $('div.col-xs-12')
        .map((i, elem) => {
            const $item = cheerio.load(elem);
            const title = $item('div > span.padding-sm > b > a:first-child').text();
            const $descriptionWrapper = cheerio.load('<div></div>');
            $descriptionWrapper('div').append(
                $item('div.clearfix')
                    .first()
                    .nextAll()
            );
            const description = $descriptionWrapper.html();
            const pubDate = new Date(
                $descriptionWrapper('div.padding-sm.fontsize-sm')
                    .text()
                    .replace(dateTextMapping[language], '') + ' +8'
            ).toUTCString();
            const link = $item('div > span.padding-sm > b > a:first-child').attr('href');
            return {
                title,
                description,
                pubDate,
                link,
            };
        })
        .get();

    const titleMapping = {
        ch: '澳門特別行政區政府 抗疫專頁：最新消息',
        pt: 'Macau Pagina Electrónica Especial Contra Epidemias: Notícias',
        en: 'Macao Pagina Electrónica Especial Contra Epidemias: What’s New',
    };
    const sourceLink = `https://www.ssm.gov.mo/apps1/PreventWuhanInfection/${language}.aspx`;

    ctx.state.data = {
        title: titleMapping[language],
        link: sourceLink,
        description: titleMapping[language],
        item: items,
    };
};
