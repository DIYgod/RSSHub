// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { config } from '@/config';
import { art } from '@/utils/render';
import * as path from 'node:path';

const headers = {
    cookie: config.ncm.cookies,
    Referer: 'https://music.163.com/',
};

function getItem(records) {
    if (!records || records.length === 0) {
        return [
            {
                title: '暂无听歌排行',
            },
        ];
    }

    return records.map((record, index) => {
        const song = record.song;

        const artists_paintext = song.ar.map((a) => a.name).join('/');

        const html = art(path.join(__dirname, '../templates/music/userplayrecords.art'), {
            index,
            record,
            song,
        });

        return {
            title: `[${index + 1}] ${song.name} - ${artists_paintext}`,
            link: `http://music.163.com/song?id=${song.id}`,
            author: artists_paintext,
            description: html,
        };
    });
}

export default async (ctx) => {
    const uid = ctx.req.param('uid');
    const type = Number.parseInt(ctx.req.param('type')) || 0;

    const url = `https://music.163.com/api/v1/play/record?uid=${uid}&type=${type}`;
    const response = await got(url, { headers });

    const records = type === 1 ? response.data.weekData : response.data.allData;

    ctx.set('data', {
        title: `${type === 1 ? '听歌榜单（最近一周）' : '听歌榜单（所有时间}'} - ${uid}}`,
        link: `https://music.163.com/user/home?id=${uid}`,
        updated: response.headers.date,
        item: getItem(records),
    });
};
