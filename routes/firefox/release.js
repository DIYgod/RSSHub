const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    if (ctx.params.platform === 'desktop') {
        ctx.params.platform = '';
    }
    if (ctx.params.platform === 'android-beta') {
        ctx.params.platform = 'android/beta';
    }
    const response = await axios.get(`https://www.mozilla.org/en-US/firefox/${ctx.params.platform}/notes/`);
    const data = response.data;
    const $ = cheerio.load(data);

    ctx.state.data = {
        title: `Firefox ${ctx.params.platform} release note`,
        link: `https://www.mozilla.org/en-US/firefox/${ctx.params.platform}/notes/`,
        item: [
            {
                title: `Firefox ${ctx.params.platform} ${$('.version')
                    .find('h2')
                    .text()} release note`,
                link: `https://www.mozilla.org/en-US/firefox/${ctx.params.platform}/notes/`,
                description: $('.notes-section').html(),
                guid: $('.version')
                    .find('h2')
                    .text(),
                pubDate: new Date(
                    $('.version')
                        .find('p')
                        .text()
                ).toUTCString(),
            },
        ],
        description: $('.description').text(),
    };
};
