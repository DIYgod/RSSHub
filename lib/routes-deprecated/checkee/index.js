const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const { parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'https://www.checkee.info';

module.exports = async (ctx) => {
    const dispdate = ctx.params.dispdate;

    const link = `https://www.checkee.info/main.php?dispdate=${dispdate}`;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const list = $(':nth-child(11) tbody tr')
        .map(function () {
            return {
                id: $(this).find(':nth-child(2)').text(),
                visaType: $(this).find(':nth-child(3)').text(),
                visaEntry: $(this).find(':nth-child(4)').text(),
                usConsulate: $(this).find(':nth-child(5)').text(),
                major: $(this).find(':nth-child(6)').text(),
                status: $(this).find(':nth-child(7)').text(),
                checkDate: $(this).find(':nth-child(8)').text(),
                completeDate: $(this).find(':nth-child(9)').text() === '0000-00-00' ? 'Not Completed' : $(this).find(':nth-child(9)').text(),
                link: $(this).find(':nth-child(11) a').attr('href'),
                note: $(this).find(':nth-child(11) a').attr('title') || '',
            };
        })
        .get();
    list.shift();

    const out = list.map((item) => {
        const title =
            `${item.visaType} ${item.visaEntry}, ${item.usConsulate}, ` +
            `Major ${item.major}, ${item.status}. Check date: ${item.checkDate}` +
            (item.completeDate === 'Not Completed' ? '' : `, Complete: ${item.completeDate}`) +
            ` | ID: ${item.id}`;
        const itemUrl = url.resolve(host, item.link);
        const date_value = item.checkDate;
        const description = item.note === '' ? title : item.note;

        return {
            title,
            link: itemUrl,
            description,
            pubDate: timezone(parseRelativeDate(date_value), 8),
        };
    });

    ctx.state.data = {
        title: `Check Reporter Results: ${dispdate}`,
        link,
        item: out,
    };
};
