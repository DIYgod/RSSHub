// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://antibody-software.com';

export default async (ctx) => {
    const currentUrl = `${rootUrl}/wizfile/download`;

    const response = await got(currentUrl);
    const $ = load(response.data);

    const items = $('section.blog-section > div > div > div > h4')
        .map((_, item) => {
            const title = $(item)
                .text()
                .replace(/\(.*?\)/, '');
            const pubDate = parseDate(
                $(item)
                    .find('span')
                    .text()
                    .match(/\((.*?)\)/)[1]
            );

            const description = $(item).next().html();

            return {
                title,
                description,
                pubDate,
                guid: `${currentUrl}${title}`,
            };
        })
        .get();

    ctx.set('data', {
        title: `WziFile - 更新日志`,
        link: currentUrl,
        item: items,
    });
};
