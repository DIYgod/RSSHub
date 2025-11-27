import path from 'node:path';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/music/djradio/:id/:info?',
    categories: ['multimedia'],
    example: '/163/music/djradio/347317067',
    parameters: { id: '节目 id, 可在电台节目页 URL 中找到', info: '默认在正文尾部显示节目相关信息，任意值为不显示' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    name: '电台节目',
    maintainers: ['magic-akari'],
    handler,
};

const ProcessFeed = (id, limit, offset) =>
    cache.tryGet(
        `163:music:djradio:${id}:${limit}:${offset}`,
        async () =>
            await got.post('https://music.163.com/api/dj/program/byradio', {
                headers: {
                    Referer: 'https://music.163.com/',
                },
                form: {
                    radioId: id,
                    limit,
                    offset,
                },
            }),
        config.cache.routeExpire,
        false
    );

async function handler(ctx) {
    const id = ctx.req.param('id');
    const info = !ctx.req.param('info');

    const response = await ProcessFeed(id, 1, 0);

    const programs = response.data.programs || [];
    const { radio, dj } = programs[0] || { radio: {}, dj: {} };
    const count = response.data.count || 0;

    const countPage = Array.from({ length: Math.ceil(count / 500) }, (_, i) => i);

    const items = await Promise.all(
        countPage.map(async (item) => {
            const response = await ProcessFeed(id, 500, item * 500);
            const programs = response.data.programs || [];
            const list = programs.map((pg) => {
                const description = (pg.description || '').split('\n').map((p) => p);
                const duration = Math.trunc(pg.duration / 1000);
                const mm_ss_duration = `${(duration / 60).toFixed(0).padStart(2, '0')}:${(duration % 60).toFixed(0).padStart(2, '0')}`;

                const html = art(path.join(__dirname, '../templates/music/djradio-content.art'), {
                    pg,
                    description,
                    itunes_duration: mm_ss_duration,
                    info,
                });

                return {
                    title: pg.name,
                    link: 'https://music.163.com/program/' + pg.id,
                    pubDate: parseDate(pg.createTime),
                    published: parseDate(pg.createTime),
                    author: pg.dj.nickname,
                    description: html,
                    content: { html },
                    itunes_item_image: pg.coverUrl,
                    enclosure_url: `https://music.163.com/song/media/outer/url?id=${pg.mainTrackId}.mp3`,
                    enclosure_type: 'audio/mpeg',
                    itunes_duration: duration,
                };
            });
            return list;
        })
    );

    return {
        title: radio.name,
        link: `https://music.163.com/djradio?id=${id}`,
        subtitle: radio.desc,
        description: radio.desc,
        author: dj.nickname,
        updated: radio.lastProgramCreateTime,
        icon: radio.picUrl,
        image: radio.picUrl,
        itunes_author: dj.nickname,
        itunes_category: radio.category,
        item: items.flat(),
    };
}
