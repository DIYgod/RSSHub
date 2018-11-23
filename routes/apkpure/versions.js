const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const { DateTime } = require('luxon');

module.exports = async (ctx) => {
    const { region, pkg } = ctx.params;
    const prefix = region === 'en' ? 'https://apkpure.com' : `https://apkpure.com/${region}`;
    let $ = await axios.get(`${prefix}/search?q=${pkg}`).then((r) => cheerio.load(r.data));
    const apppage = $('.search-title:nth-child(1)>a').attr('href');
    const link = `https://apkpure.com${apppage}/versions`;
    console.log(link);
    $ = await axios.get(link).then((r) => cheerio.load(r.data));
    ctx.state.data = {
        title: $('.ver-top-h1').text(),
        description: $('.ver-top-title>h2').text(),
        link: decodeURI(link),
        item: $('.ver li')
            .toArray()
            .map((ver) => ({
                title: $(ver)
                    .find('.ver-item-n')
                    .text(),
                description: $(ver)
                    .find('a')
                    .attr('title'),
                link: `https://apkpure.com${decodeURI(
                    $(ver)
                        .find('a')
                        .attr('href')
                        .split('?from')[0]
                )}`,
                pubDate: DateTime.fromISO(
                    $(ver)
                        .find('.update-on')
                        .text()
                ).toRFC2822(),
            })),
    };
};
