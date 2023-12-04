const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '-1';
    const language = ctx.params.language ?? '';
    const latestAdditions = ctx.params.latestAdditions ?? '1';
    const latestEdits = ctx.params.latestEdits ?? '1';
    const latestAlerts = ctx.params.latestAlerts ?? '1';
    const latestPictures = ctx.params.latestPictures ?? '1';

    if (language && !isValidHost(language)) {
        throw Error('Invalid language');
    }

    const rootUrl = `https://${language === 'en' || language === '' ? '' : `${language}.`}myfigurecollection.net`;
    const currentUrl = `${rootUrl}/browse.v4.php?mode=activity&latestAdditions=${latestAdditions}&latestEdits=${latestEdits}&latestAlerts=${latestAlerts}&latestPictures=${latestPictures}&rootId=${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.activity-wrapper')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: `${item.find('.activity-label').text().split(' • ')[0]}: ${item.find('.stamp-anchor').text()}`,
                link: `${rootUrl}${item.find('.stamp-anchor .tbx-tooltip').attr('href')}`,
                pubDate: timezone(parseDate(item.find('.activity-time span').attr('title')), +0),
                author: item.find('.user-anchor').text(),
                description: art(path.join(__dirname, 'templates/activity.art'), {
                    changelog: item.find('.changelog').text(),
                    pictures: item
                        .find('.picture-icon')
                        .toArray()
                        .map((image) =>
                            $(image)
                                .html()
                                .match(/url\((.*)\)/)[1]
                                .replace(/\/thumbnails/, '')
                        ),
                }),
            };
        });

    ctx.state.data = {
        title: $('title')
            .text()
            .replace(/ \(.*\)/, ''),
        link: currentUrl,
        item: items,
    };
};
