import { load } from 'cheerio';
import pMap from 'p-map';

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

    const list: Array<{ title: string; img: string; link: string; isExternal: boolean }> = response.topics
        .map((item) => ({
            title: item.text,
            img: item.img,
            link: new URL(item.link, 'https://www.monsterhunter.com').href,
            isExternal: item.linkType === '_blank',
        }))
        .filter((item, index, items) => items.findIndex(({ link }) => link === item.link) === index);

    const item = await pMap(
        list,
        async (item) => {
            const fallback = { title: item.title, description: `<img src="https://www.monsterhunter.com/world-iceborne/${item.img}">` };
            const details = item.isExternal
                ? fallback
                : await cache.tryGet(`${item.link}:details`, async () => {
                      try {
                          const detailResponse = await ofetch(item.link.replace('/cn/', '/') + 'inc/contents_cn.html');
                          const $ = load(detailResponse);
                          return { title: $('.bg-h2').text(), description: $('#contents').html() };
                      } catch {
                          return {};
                      }
                  });
            return { ...fallback, ...details, link: item.link, author: 'MONSTER HUNTER WORLD: ICEBORNE' };
        },
        { concurrency: 3 }
    );

    return {
        title: '怪物猎人世界最新消息',
        link: url,
        item,
    };
}
