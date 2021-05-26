const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.un.org/depts/dhl/resguide/scact_veto_table_en.htm';

    const response = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.data);
    const list = $('.tablefont > tbody > tr').slice(3);

    const items = [];

    for (let i = 0; i < list.length - 1; i++) {
        const content = cheerio.load(list[i]);

        let date = content('td:nth-child(1)').text();
        if (date.includes('-')) {
            date = date.split('-')[1];
        }

        const resolution = content('td:nth-child(2)');
        const meeting = content('td:nth-child(3)');
        const agenda = content('td:nth-child(4)');
        let country = content('td:nth-child(5)');
        country = cheerio.load(country.html().replace('<br>', ' and '));

        const item = {
            title: `${country.text().trim()} vetoed a Resolution`,
            desc: `${country('body').html()} vetoed ${agenda.html()}. <br/> <br/> <b>Resolution: </b> ${resolution.html()}<br/><br/>  <b>Meeting Record: </b> ${meeting.html()}`,
            url: resolution.find('a').attr('href'),
            guid: `scveto:${resolution.text()}`,
            pubDate: new Date(date).toISOString(),
        };

        items.push(item);
    }

    ctx.state.data = {
        title: 'United Nations Security Council Vetoed Resolutions',
        link: 'http://research.un.org/en/docs/sc/quick/veto',
        description:
            'The United Nations Security Council "veto power" refers to the power of the permanent members of the UN Security Council (China, France, Russia, United Kingdom, and United States) to veto any "substantive" resolution. Aka, abuse of power.',
        item: items.map((item) => ({
            title: item.title,
            description: item.desc,
            link: item.url,
            guid: item.guid,
            pubDate: item.pubDate,
        })),
    };
};
