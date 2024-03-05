import got from '@/utils/got';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { app } = ctx.req.param();
    const { data: response } = await got(`https://f-droid.org/en/packages/${app}/`);
    const $ = cheerio.load(response);

    const appName = $('.package-title').find('h3').text().trim();

    const items = $('.package-versions-list .package-version')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.package-version-header a');
            const version = a.eq(0).attr('name');
            return {
                title: version,
                guid: a.eq(1).attr('name'),
                pubDate: parseDate($item.find('.package-version-header').text().split('Added on ')[1]),
                description: [$item.find('.package-version-download').html(), $item.find('.package-version-requirement').html(), $item.find('.package-version-source').html()].join('<br>'),
                link: `https://f-droid.org/en/packages/${app}/#${version}`,
            };
        });

    ctx.set('data', {
        title: `${appName} releases on F-Droid`,
        discription: $('.package-summary').text(),
        link: `https://f-droid.org/en/packages/${app}/`,
        item: items,
    });
};
