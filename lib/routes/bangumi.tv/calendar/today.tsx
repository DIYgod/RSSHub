import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { parseDate } from '@/utils/time';

import { getData } from './_base';

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
                    const url = site.url ?? siteMeta[site.site].urlTemplate.replace('{{id}}', () => site.id);
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
    const [list, data] = await getData();
    const siteMeta = data.siteMeta;

    const day = Temporal.Now.zonedDateTimeISO('Asia/Tokyo').dayOfWeek % 7;

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
            const now = Temporal.Now.zonedDateTimeISO('UTC').with({ second: 0 });
            const begin = (bgm.begin && parseDate(bgm.begin)?.toZonedDateTimeISO('UTC')) || now;
            const updated = now.with({ hour: begin.hour, minute: begin.minute, second: begin.second });

            const link = `https://bangumi.tv/subject/${bgm.bgmId}`;
            const id = `${link}#${updated.toPlainDate().toLocaleString('zh-CN')}`;

            const html = renderTodayDescription(bgm, siteMeta);

            return {
                id,
                guid: id,
                title: [
                    bgm.title,
                    Object.values<string[]>(bgm.titleTranslate)
                        .map((t) => t.join('｜'))
                        .join('｜'),
                ]
                    .filter(Boolean) // don't join if empty
                    .join('｜'),
                updated: updated.toInstant(),
                pubDate: updated.toInstant(),
                link,
                description: html,
                content: { html },
            };
        }),
    };
}
