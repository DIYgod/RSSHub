import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/world-iceborne/news',
    categories: ['game'],
    example: '/monsterhunter/world-iceborne/news',
    radar: [
        {
            source: ['www.monsterhunter.com/', 'www.monsterhunter.com/*path'],
        },
    ],
    name: 'World: Iceborne 最新消息',
    maintainers: ['DIYgod'],
    handler,
};

async function handler() {
    const url = 'https://www.monsterhunter.com/world-iceborne/cn/news/';
    const response = await ofetch(`https://www.monsterhunter.com/world-iceborne/assets/data/cn/news.json?_=${Date.now()}`);

    const list = response.topics.map((item) => ({
        title: item.text,
        img: item.img,
        link: new URL(item.link, 'https://www.monsterhunter.com').href,
        isExternal: item.linkType === '_blank',
    }));

    const item = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                let title, description;
                if (item.isExternal) {
                    title = item.title;
                    description = `<img src="https://www.monsterhunter.com/world-iceborne/${item.img}">`;
                } else {
                    try {
                        const detailResponse = await ofetch(item.link.replace('/cn/', '/') + 'inc/contents_cn.html');
                        const $ = load(detailResponse);
                        title = $('.bg-h2').text().trim();
                        description = $('#contents').html();
                    } catch {
                        title = item.title;
                        description = `<img src="https://www.monsterhunter.com/world-iceborne/${item.img}">`;
                    }
                }

                return {
                    title,
                    description,
                    link: item.link,
                    author: 'MONSTER HUNTER WORLD: ICEBORNE',
                };
            })
        )
    );

    return {
        title: '怪物猎人世界最新消息',
        link: url,
        item,
    };
}
