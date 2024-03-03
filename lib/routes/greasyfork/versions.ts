// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const script = ctx.req.param('script');
    const currentUrl = `https://greasyfork.org/scripts/${script}/versions`;
    const response = await got(currentUrl);
    const $ = load(response.data);

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name=description]').attr('content'),
        item: $('.history_versions li')
            .get()
            .map((item) => {
                item = $(item);
                const versionNumberLink = item.find('.version-number a');

                return {
                    title: versionNumberLink.text(),
                    description: item.find('.version-changelog').text().trim(),
                    pubDate: parseDate(item.find('gf-relative-time').attr('datetime')),
                    link: versionNumberLink.attr('href'),
                };
            }),
    });
};
