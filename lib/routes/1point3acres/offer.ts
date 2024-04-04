import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import path from 'node:path';

export const route: Route = {
    path: '/offer/:year?/:major?/:school?',
    categories: ['bbs'],
    example: '/1point3acres/offer/12/null/CMU',
    parameters: { year: '录取年份  id，空为null', major: '录取专业 id，空为null', school: '录取学校 id，空为null' },
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
            source: ['offer.1point3acres.com/'],
            target: '/offer',
        },
    ],
    name: '录取结果',
    maintainers: ['EthanWng97'],
    handler,
    url: 'offer.1point3acres.com/',
    description: `:::tip 三个 id 获取方式
  1.  打开 [https://offer.1point3acres.com](https://offer.1point3acres.com)
  2.  打开控制台
  3.  切换到 Network 面板
  4.  点击 搜索 按钮
  5.  点击 results?ps=15\&pg=1 POST 请求
  6.  找到 Request Payload 请求参数，例如 \`filters: {planyr: "13", planmajor: "1", outname_w: "ACADIAU"}\` ，则三个 id 分别为: 13,1,ACADIAU
  :::`,
};

async function handler(ctx) {
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
    return {
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
    };
}
