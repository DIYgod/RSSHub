const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get(`https://f-droid.org/en/packages/${ctx.params.app}/`);
    const data = response.data;
    const $ = cheerio.load(data);

    const app_name = $('.package-title').find('h3').text();
    const app_descr = $('.package-title').find('.package-summary').text();

    const items = [];
    $('.package-versions-list')
        .find('.package-version')
        .each(function () {
            const item = {};
            const version = $(this).find('.package-version-header').find('a').eq(0).attr('name');
            item.title = version;
            item.guid = $(this).find('.package-version-header').find('a').eq(1).attr('name');
            item.pubDate = new Date($(this).find('.package-version-header').text().split('Added on ')[1]).toUTCString();
            item.description = [$(this).find('.package-version-download').html(), $(this).find('.package-version-requirement').html(), $(this).find('.package-version-source').html()].join('<br/>');
            item.link = `https://f-droid.org/en/packages/${ctx.params.app}/#${version}`;

            items.push(item);
        });

    ctx.state.data = {
        title: `${app_name} releases on F-Droid`,
        discription: app_descr,
        link: `https://f-droid.org/en/packages/${ctx.params.app}/`,
        item: items,
    };
};
