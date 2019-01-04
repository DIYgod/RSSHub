const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const { tid } = ctx.params;
    const link = `https://nga.178.com/read.php?tid=${tid}&rand=${Math.random() * 1000}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const response = await axios({
        method: 'get',
        url: link,
        responseType: 'arraybuffer',
        headers: {
            Cookie: `guestJs=${timestamp};`,
        },
    });

    const htmlString = iconv.decode(response.data, 'gbk');
    const $ = cheerio.load(htmlString);
    const title = $('title').text() || '';
    const description = $('#postcontentandsubject0').html() || '';
    let pubDate = new Date($('#postdate0').text()).toUTCString();

    if ($('#alertc0').length > 0) {
        const matches = htmlString.match(/<span id='alertc0'><\/span><script>commonui\.loadAlertInfo\('\[E(\d+)[\s\S]+?\t|\n\]','alertc0'\)<\/script>/);

        if (matches && matches[1]) {
            pubDate = new Date(parseInt(matches[1]) * 1000).toUTCString();
        }
    }

    const items = [
        {
            title,
            link,
            description,
            guid: pubDate,
            pubDate,
        },
    ];

    ctx.state.data = {
        title: `nga-${title}`,
        link,
        item: items,
    };
};
