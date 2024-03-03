// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
const domain = 'manhua.fffdm.com';
const host = `https://${domain}`;
import { art } from '@/utils/render';
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';

const get_pic = async (url) => {
    const response = await got(url);
    const data = response.data;
    return {
        comicTitle: data.mhinfo.title,
        chapterTitle: data.title,
        pics: data.cont,
        pubDate: parseDate(data.mh.time),
    };
};

export default async (ctx) => {
    const id = ctx.req.param('id');
    const count = ctx.req.query('limit') || 99999;
    const cdnNum = ctx.req.param('cdn') || 5;
    const cdn = !isNaN(Number.parseInt(cdnNum)) && 1 <= Number.parseInt(cdnNum) && Number.parseInt(cdnNum) <= 5 ? `https://p${cdnNum}.fzacg.com` : `https://p5.fzacg.com`;

    // 获取漫画清单
    const response = await got(`${host}/api/manhua/${id}`);
    const data = response.data;

    const chapter_detail = await Promise.all(
        data.mhlist.splice(0, count).map((item) => {
            const url = `${host}/api/manhua/${id}/${item.url}`;
            return cache.tryGet(url, async () => {
                const picContent = await get_pic(url);
                return {
                    title: picContent.chapterTitle,
                    description: art(path.join(__dirname, '../templates/manhua.art'), { pic: picContent.pics, cdn }),
                    link: `${host}/${id}/${item.url}/`,
                    comicTitle: picContent.comicTitle,
                    pubDate: picContent.pubDate,
                };
            });
        })
    );
    ctx.set('data', {
        title: '风之动漫 - ' + chapter_detail[0].comicTitle,
        link: `${host}/${id}`,
        description: '风之动漫',
        item: chapter_detail,
    });
};
