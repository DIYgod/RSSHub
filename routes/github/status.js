// Warning: The author still knows nothing about javascript!

// params:
// type: notification type

const axios = require('../../utils/axios'); // get web content
const cheerio = require('cheerio'); // html parser

const base_url = 'https://status.github.com';
module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: base_url,
    });
    const data = response.data; // content is html format
    const $ = cheerio.load(data);

    const msg = [];
    const a = $('div#message-list').find('div.message');
    for (let i = 0; i < a.length; ++i) {
        const content = $(a[i])
            .find('span.title')
            .text();
        let color = 'green';
        let type = '+ Normal';
        switch ($(a[i]).attr('data-status')) {
            case 'good':
                color = 'green';
                type = '+ Normal';
                break;
            case 'minor':
                color = 'orange';
                type = '- Warning';
                break;
            case 'major':
                color = 'red';
                type = '* Error';
                break;
        }
        const item = {
            title: type.slice(0, 2) + content,
            pubDate: new Date(
                $(a[i])
                    .find('time')
                    .attr('datetime')
            ).toUTCString(),
            description: `<span style="color:${color}">${content}</span>`,
            author: 'GitHub.com',
            category: type.slice(2),
        };
        msg.push(item);
    }

    // feed the data
    ctx.state.data = {
        title: 'GitHub Status',
        link: base_url,
        item: msg,
    };
};
