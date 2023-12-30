const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://cdn.sketchapp.com/releases.html',
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.update');
    ctx.state.data = {
        title: 'Sketch Release版本',
        link: response.url,
        description: 'Sketch is a design toolkit built to help you create your best work — from your earliest ideas, through to final artwork.',
        image: 'https://cdn.sketchapp.com/assets/components/block-buy/logo.png',

        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    // sketch update 提供的时间 年月反了.要重新调整
                    const pubday = item.find('section.update-highlights time').attr('datetime').substr(0, 2);
                    const pubmonth = item.find('section.update-highlights time').attr('datetime').substr(3, 2);
                    const pubyear = item.find('section.update-highlights time').attr('datetime').substr(-4);
                    const pubdateString = pubmonth + `-` + pubday + `-` + pubyear;
                    return {
                        title: item.find('h2.update-version-title').first().text().trim(),
                        description: `${item.find('section.update-highlights .lead').html()}<br>
                        ${item.find('section.update-highlights footer').html()}<br>
                        ${item.find('aside.update-details .mask').html()}`,
                        link: `https://www.sketch.com/updates/${item.find('.update-version-title a').attr('href')}`,
                        pubDate: new Date(pubdateString),
                        guid: item.find('h2.update-version-title').first().text().trim(),
                    };
                })
                .get(),
    };
};
