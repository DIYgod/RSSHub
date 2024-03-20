import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export const route: Route = {
    path: '/{.*}?',
    categories: ['multimedia'],
    name: '通用',
    maintainers: ['cgkings', 'nczitzk'],
    handler,
    description: `**类型**

    | 最新 | 热门    | 随机   | 指定演员 | 指定标签 |
    | ---- | ------- | ------ | -------- | -------- |
    | new  | popular | random | actress  | tag      |

    **关键词**

    | 空 | 日期范围    | 演员名       | 标签名         |
    | -- | ----------- | ------------ | -------------- |
    |    | 7 / 30 / 60 | Yua%20Mikami | Adult%20Awards |

    **示例说明**

    -   \`/141ppv/new\`

        仅当类型为 \`new\` \`popular\` 或 \`random\` 时关键词为 **空**

    -   \`/141ppv/popular/30\`

        \`popular\` \`random\` 类型的关键词可填写 \`7\` \`30\` 或 \`60\` 三个 **日期范围** 之一，分别对应 **7 天**、**30 天** 或 **60 天内**

    -   \`/141ppv/actress/Yua%20Mikami\`

        \`actress\` 类型的关键词必须填写 **演员名** ，可在 [此处](https://141ppv.com/actress) 演员单页链接中获取

    -   \`/141ppv/tag/Adult%20Awards\`

        \`tag\` 类型的关键词必须填写 **标签名** 且标签中的 \`/\` 必须替换为 \`%2F\` ，可在 [此处](https://141ppv.com/tag) 标签单页链接中获取

    -   \`/141ppv/date/2020/07/30\`

        \`date\` 类型的关键词必须填写 **日期**`,
};

async function handler(ctx) {
    const rootUrl = 'https://www.141ppv.com';
    const currentUrl = `${rootUrl}${getSubPath(ctx)}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    if (getSubPath(ctx) === '/') {
        ctx.redirect(`/141ppv${$('.overview').first().attr('href')}`);
        return;
    }

    const items = $('.columns')
        .toArray()
        .map((item) => {
            item = $(item);

            const id = item.find('.title a').text();
            const size = item.find('.title span').text();
            const pubDate = item.find('.subtitle a').attr('href').split('/date/').pop();
            const description = item.find('.has-text-grey-dark').text();
            const actresses = item
                .find('.panel-block')
                .toArray()
                .map((a) => $(a).text().trim());
            const tags = item
                .find('.tag')
                .toArray()
                .map((t) => $(t).text().trim());
            const magnet = item.find('a[title="Magnet torrent"]').attr('href');
            const link = item.find('a[title="Download .torrent"]').attr('href');
            const onErrorAttr = item.find('.image').attr('onerror');
            const backupImageRegex = /this\.src='(.*?)'/;
            const match = backupImageRegex.exec(onErrorAttr);
            const image = match ? match[1] : item.find('.image').attr('src');

            return {
                title: `${id} ${size}`,
                pubDate: parseDate(pubDate, 'YYYY/MM/DD'),
                link: new URL(item.find('a').first().attr('href'), rootUrl).href,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image,
                    id,
                    size,
                    pubDate,
                    description,
                    actresses,
                    tags,
                    magnet,
                    link,
                }),
                author: actresses.join(', '),
                category: [...tags, ...actresses],
                enclosure_type: 'application/x-bittorrent',
                enclosure_url: magnet,
            };
        });

    return {
        title: `141PPV - ${$('title').text().split('-')[0].trim()}`,
        link: currentUrl,
        item: items,
    };
}
