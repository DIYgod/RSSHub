import got from '~/utils/got.js';
import cheerio from 'cheerio';
const dayjs = require('dayjs');

export default async (ctx) => {
    const includePreRelease = ctx.params.pre;
    const response = await got(`https://www.python.org/downloads`);
    const $ = cheerio.load(response.data);
    const items = [];
    $('.list-row-container.menu li').each(function () {
        const $listElement = $(this);
        const title = $listElement.find('span.release-number').text();
        if (title) {
            if (!includePreRelease) {
                if (title.includes('rc')) {
                    return;
                }
            }
            items.push({
                title: $listElement.find('span.release-number').text(),
                description: title,
                link: $listElement.find('.release-enhancements a').attr('href'),
                pubDate: dayjs($listElement.find('.release-date').text()),
            });
        }
    });
    ctx.state.data = {
        title: 'cpython',
        link: 'https://www.python.org/',
        item: items,
    };
};
