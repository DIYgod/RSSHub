const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const language = ctx.params.lang.toLowerCase();
    const languageKey = language === 'ch' ? 'zhant' : language;

    const dataUrl = 'https://gcloud.gcs.gov.mo/json/ncvbase.json';
    const response = await got({
        method: 'get',
        url: dataUrl,
    });

    const items = response.data.json
        .filter((item) => item['broadcastStatus_' + languageKey] === 'Broadcasted')
        .slice(0, 20)
        .map((item) => {
            const title = item['subject_' + languageKey];
            const $ = cheerio.load('<div id="root"><b id="department"></b><div id="photo"></div><div id="content"></div></div>');
            if (item.contentPhotos) {
                $('#photo').append(item.contentPhotos.map((photo) => `<img src="${photo.url}"></img>`));
            }
            $('#content').append(item['content_' + languageKey]);
            $('#department').append(item['departments_' + languageKey]);
            const description = $('#root').html();
            const pubDate = new Date(item['broadcastTime_' + languageKey] + ' +8').toUTCString();
            const link = item['url_' + languageKey];
            return {
                title,
                description,
                pubDate,
                link,
            };
        });

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
