import path from 'node:path';

import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got';
import { art } from '@/utils/render';

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

export const route: Route = {
    path: '/music/user/playrecords/:uid/:type?',
    categories: ['multimedia'],
    example: '/163/music/user/playrecords/45441555/1',
    parameters: { uid: '用户 uid, 可在用户主页 URL 中找到', type: '排行榜类型，0所有时间(默认)，1最近一周' },
    features: {
        requireConfig: [
            {
                name: 'NCM_COOKIES',
                optional: true,
                description: '网易云音乐登陆后的 cookie 值，可在浏览器控制台通过`document.cookie`获取。',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户听歌排行',
    maintainers: ['alfredcai'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const type = Number.parseInt(ctx.req.param('type')) || 0;

    const url = `https://music.163.com/api/v1/play/record?uid=${uid}&type=${type}`;
    const response = await got(url, { headers });

    const records = type === 1 ? response.data.weekData : response.data.allData;

    return {
        title: `${type === 1 ? '听歌榜单（最近一周）' : '听歌榜单（所有时间}'} - ${uid}}`,
        link: `https://music.163.com/user/home?id=${uid}`,
        updated: response.headers.date,
        item: getItem(records),
    };
}
