const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');
const date = require('../../utils/date');

const host = 'https://www.checkee.info';

module.exports = async (ctx) => {
    const dispdate = ctx.params.dispdate;

    const link = `https://www.checkee.info/main.php?dispdate=${dispdate}`;
    const cache = await ctx.cache.get(link);
    if (cache) {
        ctx.state.data = {
            title: `Check Reporter Results: ${dispdate}`,
            link: link,
            item: JSON.parse(cache),
        };
        return Promise.resolve();
    }
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    const list = $(':nth-child(11) tbody tr').map(function() {
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
    }).get();
    list.shift();

    const out = await Promise.all(
        list.map(async (item) => {
            const title = `${item.visaType} ${item.visaEntry}, ${item.usConsulate}, `
                    + `Major ${item.major}, ${item.status}. Check date: ${item.checkDate}`
                    + (item.completeDate === 'Not Completed' ? '' : `, Complete: ${item.completeDate}`)
                    + ` | ID: ${item.id}`;
            const itemUrl = url.resolve(host, item.link);
            const date_value = item.checkDate;
            const description = item.note === '' ? title : item.note;

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: date(date_value, 8)
            };
            return Promise.resolve(single);
        })
    );

    ctx.cache.set(link, JSON.stringify(out), 30 * 60);
    ctx.state.data = {
        title: `Check Reporter Results: ${dispdate}`,
        link: link,
        item: out,
    };
};
