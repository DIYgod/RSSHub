const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const utils = require('../wikipedia/utils');

module.exports = async (ctx) => {
    const url = 'https://en.wikipedia.org/wiki/List_of_vetoed_United_Nations_Security_Council_resolutions';

    const response = await axios({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.data);
    const list = $('.sortable > tbody > tr').slice(1, 11);

    list.map((i) => utils.ProcessLink($(list[i]), 'en'));

    const items = [];

    for (let i = 0; i < list.length - 1; i++) {
        const content = cheerio.load(list[i]);

        const date = content('td:nth-child(1)');
        const resolution = content('td:nth-child(2)');
        const meeting = content('td:nth-child(3)');
        const agenda = content('td:nth-child(4)');
        let country = content('td:nth-child(5)');
        country = cheerio.load(country.html().replace('<br>', ' and'));

        const item = {
            title: `${country.text().trim()} vetoed a Resolution`,
            desc: `${country('body').html()} vetoed ${agenda.html()}. <br/> <br/> <b>Resolution: </b> ${resolution.html()}<br/><br/>  <b>Meeting Record: </b> ${meeting.html()}`,
            url: resolution.find('a').attr('href'),
            guid: `scveto:${resolution.text()}`,
            pubDate: new Date(date.text()).toISOString(),
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
