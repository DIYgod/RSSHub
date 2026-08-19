import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/changelog',
    categories: ['program-update'],
    example: '/simpread/changelog',
    name: '更新日志',
    maintainers: ['zytomorrow'],
    handler,
};

const textColor = {
    important: '#9c27b0',
    add: '#4caf50',
    change: '#ffc107',
    fix: '#f44336',
    complete: '#03a9f4',
};

async function handler() {
    const response = await ofetch('https://simpread.pro/changelog.html');
    const $ = load(response);

    return {
        title: 'SimpRead 更新日志',
        link: 'https://simpread.pro/changelog.html',
        description: $('body > div.container.changelog > div.desc').html(),
        item: $('.version')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const year = $item.find('.year').html();
                const monthDay = $item.find('.day').html();

                let version = $item
                    .find('.num > a')
                    .contents()
                    .filter((_, node) => node.type === 'text')
                    .text();
                if (version === '') {
                    version = $item
                        .find('.num')
                        .contents()
                        .filter((_, node) => node.type === 'text')
                        .text();
                }

                let versionType = $item.find('.num > a > i').attr('class') ?? $item.find('.num > i').attr('class') ?? '';
                if (versionType.includes('chrome')) {
                    versionType = 'Chrome';
                } else if (versionType.includes('apple')) {
                    versionType = 'Safari';
                } else if (versionType.includes('code')) {
                    versionType = 'UserScript';
                } else if (versionType.includes('firefox')) {
                    versionType = 'Firefox';
                }

                const detail = $item.find('.details');
                detail.find('li').each((_, li) => {
                    const $li = $(li);
                    const span = $li.find('span');
                    const spanClass = span.attr('class');
                    const text = span.html();
                    span.remove();

                    if (spanClass !== undefined) {
                        const type = spanClass.split(' ', 2)[1];
                        if (type === 'empty') {
                            $li.wrap('<ul></ul>');
                        } else {
                            $li.prepend(`<b style='color:${textColor[type]}'>${text}: </b>`);
                        }
                    }
                });

                return {
                    description: detail.html(),
                    link: 'https://simpread.pro/changelog.html',
                    pubDate: parseDate(`${year}-${monthDay!.replace('.', '-')}`),
                    title: `${versionType}${version}`,
                    author: 'SimpRead',
                };
            }),
    };
}
