// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
const getData = require('./_base');
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const [list, data] = await getData(cache.tryGet);
    const siteMeta = data.siteMeta;

    const today = new Date(Date.now());
    // 将 UTC 时间向前移动9小时，即可在数值上表示东京时间
    today.setUTCHours(today.getUTCHours() + 9);
    const day = today.getUTCDay();

    const todayList = list.find((l) => l.weekday.id % 7 === day);
    const todayBgmId = new Set(todayList.items.map((t) => t.id.toString()));
    const images = todayList.items.reduce((p, c) => {
        p[c.id] = (c.images || {}).large;
        return p;
    }, {});
    const todayBgm = data.items.filter((d) => todayBgmId.has(d.bgmId));
    for (const bgm of todayBgm) {
        bgm.image = images[bgm.bgmId];
    }

    ctx.set('data', {
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

            const html = art(path.resolve(__dirname, '../../templates/tv/today.art'), {
                bgm,
                siteMeta,
            });

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
    });
};
