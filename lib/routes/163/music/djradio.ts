// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const ProcessFeed = (limit, offset) =>
        got.post('https://music.163.com/api/dj/program/byradio', {
            headers: {
                Referer: 'https://music.163.com/',
            },
            form: {
                radioId: id,
                limit,
                offset,
            },
        });

    const response = await ProcessFeed(1, 0);

    const programs = response.data.programs || [];
    const { radio, dj } = programs[0] || { radio: {}, dj: {} };
    const count = response.data.count || 0;

    const countPage = [];
    for (let i = 0; i < Math.ceil(count / 500); i++) {
        countPage.push(i);
    }

    const items = await Promise.all(
        countPage.map(async (item) => {
            const response = await ProcessFeed(500, item * 500);
            const programs = response.data.programs || [];
            const list = programs.map((pg) => {
                const description = (pg.description || '').split('\n').map((p) => p);
                const duration = Math.trunc(pg.duration / 1000);
                const mm_ss_duration = `${(duration / 60).toFixed(0).padStart(2, '0')}:${(duration % 60).toFixed(0).padStart(2, '0')}`;

                const html = art(path.join(__dirname, '../templates/music/djradio-content.art'), {
                    pg,
                    description,
                    itunes_duration: mm_ss_duration,
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

    ctx.set('data', {
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
    });
};
