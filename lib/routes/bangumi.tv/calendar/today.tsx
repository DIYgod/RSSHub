import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';

import getData from './_base';

export const route: Route = {
    path: '/calendar/today',
    categories: ['anime'],
    example: '/bangumi.tv/calendar/today',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['bgm.tv/calendar'],
        },
    ],
    name: '放送列表',
    maintainers: ['magic-akari'],
    handler,
    url: 'bgm.tv/calendar',
};

const renderTodayDescription = (bgm, siteMeta) =>
    renderToString(
        <>
            <img src={bgm.image} />
            <ul>
                {bgm.sites.map((site) => {
                    const url = site.url ?? siteMeta[site.site].urlTemplate.replace('{{id}}', site.id);
                    const title = siteMeta[site.site].title;

                    return (
                        <li>
                            <a href={url}>{title}</a>
                        </li>
                    );
                })}
            </ul>
        </>
    );

async function handler() {
    const [list, data] = await getData(cache.tryGet);
    const siteMeta = data.siteMeta;

    const today = new Date(Date.now());
    // 将 UTC 时间向前移动9小时，即可在数值上表示东京时间
    today.setUTCHours(today.getUTCHours() + 9);
    const day = today.getUTCDay();

    const todayList = list.find((l) => l.weekday.id % 7 === day);
    const todayBgmId = new Set(todayList.items.map((t) => t.id.toString()));
    const images: { [key: string]: string } = {};
    for (const item of todayList.items) {
        images[item.id] = (item.images || {}).large;
    }
    const todayBgm = data.items.filter((d) => todayBgmId.has(d.bgmId));
    for (const bgm of todayBgm) {
        bgm.image = images[bgm.bgmId];
    }

    return {
        title: 'bangumi 每日放送',
        link: 'https://bgm.tv/calendar',
        item: todayBgm.map((bgm) => {
            const updated = new Date(Date.now());
            updated.setSeconds(0);
            const begin = new Date(bgm.begin || updated);
            updated.setHours(begin.getHours());
            updated.setMinutes(begin.getMinutes());
            updated.setSeconds(begin.getSeconds());

            const link = `https://bangumi.tv/subject/${bgm.bgmId}`;
            const id = `${link}#${new Intl.DateTimeFormat('zh-CN').format(updated)}`;

            const html = renderTodayDescription(bgm, siteMeta);

            return {
                id,
                guid: id,
                title: [
                    bgm.title,
                    Object.values(bgm.titleTranslate)
                        .map((t) => t.join('｜'))
                        .join('｜'),
                ]
                    .filter(Boolean) // don't join if empty
                    .join('｜'),
                updated: updated.toISOString(),
                pubDate: updated.toUTCString(),
                link,
                description: html,
                content: { html },
            };
        }),
    };
}
