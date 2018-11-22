const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `https://huya.com/${id}`;
    const response = await axios({
        method: 'get',
        url: url,
    });

    const $ = cheerio.load(response.data);

    const timestamp = parseInt(response.data.match(/"startTime":"?(\d+)/)[1]) * 1000;

    let item;
    if (response.data.match(/"isOn":(\w{4})/)[1] === 'true') {
        item = [
            {
                title: $('#J_roomTitle').text(),
                guid: timestamp,
                pubDate: new Date(timestamp).toUTCString(),
                link: url,
            },
        ];
    }

    ctx.state.data = {
        title: `${$('.host-name').text()}的虎牙直播`,
        link: url,
        item: item,
    };
};
