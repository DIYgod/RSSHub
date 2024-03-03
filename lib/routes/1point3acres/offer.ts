// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import * as path from 'node:path';

export default async (ctx) => {
    // year 2017-2022
    // 2017:6   2018:11   2019:12   2020:13   2021:14   2022:15
    // CS:1     MIS:2
    const { year = 'null', major = 'null', school = 'null' } = ctx.req.param();
    // const filter = 'filters: {planyr: "12", planmajor: "1", outname_w: "CMU"}';
    const responseBasic = await got.post('https://api.1point3acres.com/offer/results', {
        searchParams: {
            ps: 15,
            pg: 1,
        },
        json: {
            filters: {
                planyr: year === 'null' ? undefined : year,
                planmajor: major === 'null' ? undefined : major,
                outname_w: school === 'null' ? undefined : school,
            },
        },
    });

    const data = responseBasic.data.results;
    // data.id-> 访问offer具体信息->获取 data.tid
    // if (data.id !== 0) {
    //     out = await Promise.all(
    //         data.map(async (item) => {
    //             var gettidresponse = await got({
    //              method: 'get',
    //              url: 'https://api.1point3acres.com/offer/results/'+ item.id +  '/backgrounds',
    //              headers: {
    //                  authorization: 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTU3Njk5Njc5OSwiZXhwIjoxNTg0ODU5MTk5fQ.eyJ1aWQiOjQ1NzQyN30.0ei5UE6OgLBzN2_IS7xUIbIfW_S1Wzl42q2UeusbboxuzvctO_4Mz6YRr6f0PBLUVZMETxt8F0_4-yqIJ3_kUQ',
    //              },
    //          });
    //         var tid = gettidresponse.data.background.tid;
    //         //https: //www.1point3acres.com/bbs/thread-581177-1-1.html
    //         console.log(tid);
    //         const threadlink = 'https://www.1point3acres.com/bbs/thread-' + tid + '-1-1.html';
    //         console.log(threadlink);
    //         return threadlink;
    //         })
    //     );
    // }
    // let responseBasic_1;
    // responseBasic_1 = await got({
    //     method: 'get',
    //     url: `https://api.1point3acres.com/offer/results/A7m20e4g/backgrounds`,
    //     headers: {
    //         authorization: `eyJhbGciOiJIUzUxMiIsImlhdCI6MTU3Njk5Njc5OSwiZXhwIjoxNTg0ODU5MTk5fQ.eyJ1aWQiOjQ1NzQyN30.0ei5UE6OgLBzN2_IS7xUIbIfW_S1Wzl42q2UeusbboxuzvctO_4Mz6YRr6f0PBLUVZMETxt8F0_4-yqIJ3_kUQ`,
    //     },
    // });
    // const tid = responseBasic_1.data.background.tid;
    ctx.set('data', {
        title: '录取结果 - 一亩三分地',
        link: 'https://offer.1point3acres.com',
        item: data.map((item) => ({
            title: `${item.planyr}年${item.planmajor}@${item.outname_w}：${item.result} - 一亩三分地`,
            description: art(path.join(__dirname, 'templates/offer.art'), {
                item,
            }),
            pubDate: parseDate(item.dateline, 'X'),
            link: 'https://offer.1point3acres.com',
            guid: `1point3acres:offer:${year}:${major}:${school}:${item.id}`,
        })),
    });
};
