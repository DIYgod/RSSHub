// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const os = (ctx.req.param('os') ?? '').toLowerCase();

    const rootUrl = 'https://www.neatdownloadmanager.com';
    const currentUrl = `${rootUrl}/index.php`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.p1')
        .toArray()
        .filter((item) => {
            item = $(item);
            const isMacOS = item.text().startsWith('dmg');

            if (os !== '') {
                return os === 'macos' ? isMacOS : !isMacOS;
            }

            return true;
        })
        .map((item) => {
            item = $(item);

            const text = item.text();
            const version = text.match(/\(ver (.*?)\)/)[1];

            return {
                title: `[${text.startsWith('dmg') ? 'macOS' : 'Windows'}] ${text}`,
                link: `${rootUrl}${item.prev().find('a').attr('href')}#${version}`,
            };
        });

    ctx.set('data', {
        title: 'Neat Download Manager',
        link: currentUrl,
        item: items,
    });
};
