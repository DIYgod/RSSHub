// journals form AAAS publishing group
//
// science:        Science
// advances:       Science Advances
// immunology:     Science Immunology
// robotics:       Science Robotics
// stke:           Science Signaling
// stm:            Science Translational Medicine

const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const pageURL = 'https://www.sciencemag.org/journals';

    const pageResponse = await got.get(pageURL);
    const $ = cheerio.load(pageResponse.data);

    const items = $('section.journal-landing')
        .map((_, elem) => {
            const url = $('div.media__icon > a', elem)
                .attr('href')
                .replace(/^http:/, 'https:')
                .replace(/\/$/, '');
            let id = /:\/\/(\w+)\./.exec(url)[1];
            if (id === 'science') {
                id = 'sci';
            } else if (id === 'stm') {
                id = 'scitransmed';
            }
            const name = $('div.media__body > h2', elem).text();
            const date = $('div.media__body > p > span', elem).text();
            const capturingRegex = /Vol\. (?<vol>\d+), No\. (?<no>\d+)/;
            const { vol, no } = $('div.media__body > p', elem)
                .contents()
                .last()
                .text()
                .match(capturingRegex).groups;
            // eg, https://advances.sciencemag.org/content/6/8
            const address = `${url}/content/${vol}/${no}`;
            // eg, https://immunology.sciencemag.org/content/immunology/5/44/F1.medium.gif
            const imageURL = `${url}/content/${id}/${vol}/${no}/F1.medium.gif`;
            const contents = `<div align="center"><img src="${imageURL}" alt="Vol. ${vol} No. ${no}" width="550" height="auto"></div>`;

            return {
                title: `${name} | Vol. ${vol} No. ${no}`,
                author: '@yech1990',
                description: contents,
                link: address,
                guid: address,
                pubDate: new Date(date).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: 'Science Covers Story',
        description: 'Find out the cover story of some Science journals.',
        link: pageURL,
        item: items,
    };
};
