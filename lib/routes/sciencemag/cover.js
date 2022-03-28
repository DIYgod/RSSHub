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

    const items = $('[class^="view-highwire-blocks-hw-"]')
        .map((_, elem) => {
            // eg, www.sciencemag.org/sites/default/files/styles/240x300__4_3_/public/highwire/covers/scitransmed/12/532/-F1.medium.gif?itok=aOwRMF-8
            const { id, vol, no } = $('div.media__icon > a > img', elem)
                .attr('src')
                .match(/\/covers\/(?<id>\w+)\/(?<vol>\d+)\/(?<no>\d+)\//).groups;
            const url = $('div.media__body > ul > li > a', elem)
                .filter((_, el) => $(el).text() === 'Current Issue')
                .attr('href')
                .replace(/^http:/, 'https:')
                .replace(/\/$/, '');
            const name = $('div.media__body > h2', elem).text();
            const date = $('div.media__body > p > span', elem).text();

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
