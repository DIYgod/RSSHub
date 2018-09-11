const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    if (ctx.params.platform === 'desktop') {
        ctx.params.platform = '';
    }
    if (ctx.params.platform === 'android-beta') {
        ctx.params.platform = 'android/beta';
    }
    if (ctx.params.platform === 'esr') {
        ctx.params.platform = 'esr';
    }

    if (ctx.params.platform != 'esr') {
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
                },
            ],
            description: $('.description').text(),
        };
    }
    else {  // firefox esr
        const response = await axios.get(`https://www.mozilla.org/en-US/security/known-vulnerabilities/firefox-esr/`);
        const data = response.data;
        const $ = cheerio.load(data);

        const obj = $('.level-heading').first();
        const title = obj.text().replace(/\s\s+/g, ' ').trim();
        const version = obj.find('a').attr('href');

        var descr = obj.next();
        descr.find('a').each(function(i,elem) {
            var h = $(this).attr('href');
            if (h.startsWith('http')) { }
            else {
                if (h.startsWith('/')) {
                    $(this).attr('href', 'https://www.mozilla.org' + h);
                }
            }
        });
        descr = descr.html();

        ctx.state.data = {
            title: `Firefox ESR release note`,
            link: `https://www.mozilla.org/en-US/security/known-vulnerabilities/firefox-esr/`,
            item: [
                {
                    title: title,
                    link: `https://www.mozilla.org/en-US/security/known-vulnerabilities/firefox-esr/${version}`,
                    guid: version,
                    description: descr,
                },
            ],
        };
    }

};
