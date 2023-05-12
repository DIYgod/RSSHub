const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const host = 'https://firecore.com/releases';
    const { data } = await got(host);
    const $ = cheerio.load(data);
    const item = $(`div.tab-pane.fade#${ctx.params.os}`);

    const chunks = [];
    let temporaryArray = [];
    item.contents().each((index, element) => {
        if (element.tagName === 'hr') {
            chunks.push(temporaryArray);
            temporaryArray = [];
        } else {
            temporaryArray.push($(element).text());
        }
    });

    const items = chunks.map((item) => {
        const releaseInfo = item[1];
        const dateRegex = /(\d{4}-\d{2}-\d{2})/;
        const parsedDate = parseDate(releaseInfo.match(dateRegex)[1]);

        // 7 11 15
        const size = item.length;
        let description = '';
        if (size === 7) {
            description += item[3] + '<br>';
            description += item[5];
        } else if (size === 11) {
            description += item[3] + '<br>';
            description += item[5] + '<br>';
            description += item[7] + '<br>';
            description += item[9];
        } else if (size === 15) {
            description += item[3] + '<br>';
            description += item[5] + '<br>';
            description += item[7] + '<br>';
            description += item[9] + '<br>';
            description += item[11] + '<br>';
            description += item[13];
        }

        return {
            title: releaseInfo,
            link: host,
            description,
            pubDate: parsedDate,
        };
    });

    ctx.state.data = {
        title: 'Infuse Release Notes',
        link: 'https://firecore.com/releases',
        item: items,
    };
};
