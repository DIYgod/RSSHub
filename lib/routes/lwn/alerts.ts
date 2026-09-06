import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/alerts/:distributor',
    categories: ['programming'],
    example: '/lwn/alerts/CentOS',
    features: {
        antiCrawler: true,
    },
    parameters: { distributor: 'Distribution identification' },
    name: 'Security alerts',
    maintainers: ['zengxs'],
    description: `| Distribution     | Identification     |
| :--------------- | :----------------- |
| Arch Linux       | \`Arch_Linux\`       |
| CentOS           | \`CentOS\`           |
| Debian           | \`Debian\`           |
| Fedora           | \`Fedora\`           |
| Gentoo           | \`Gentoo\`           |
| Mageia           | \`Mageia\`           |
| openSUSE         | \`openSUSE\`         |
| Oracle           | \`Oracle\`           |
| Red Hat          | \`Red_Hat\`          |
| Scientific Linux | \`Scientific_Linux\` |
| Slackware        | \`Slackware\`        |
| SUSE             | \`SUSE\`             |
| Ubuntu           | \`Ubuntu\`           |`,
    handler,
};

async function handler(ctx: Context) {
    const { distributor } = ctx.req.param();

    const listUrl = `https://lwn.net/Alerts/${distributor}/`;
    const res = await ofetch(listUrl);
    const $ = load(res);

    const title = $('.PageHeadline').text();

    const list = $('.ArticleText')
        .find('table tbody tr:not(:first-of-type)')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                link: new URL($item.find('td > a').attr('href')!, 'https://lwn.net').href,
                pubDate: parseRelativeDate($item.find('td:nth-of-type(3)').text()),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(`LWN.net:${item.link}`, async () => {
                const detail = await ofetch(item.link);
                const content = load(detail);
                return {
                    title: content('.PageHeadline').text(),
                    description: content('.ArticleText').html(),
                    link: item.link,
                    pubDate: item.pubDate,
                };
            }),
        { concurrency: 2 }
    );

    return {
        title,
        link: listUrl,
        item: items,
    };
}
