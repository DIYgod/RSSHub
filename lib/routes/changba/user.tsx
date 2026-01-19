import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const headers = { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' };

export const route: Route = {
    path: '/:userid',
    categories: ['social-media'],
    view: ViewType.Audios,
    example: '/changba/skp6hhF59n48R-UpqO3izw',
    parameters: { userid: '用户ID, 可在对应分享页面的 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['changba.com/s/:userid'],
        },
    ],
    name: '用户',
    maintainers: ['kt286', 'xizeyoupan', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const userid = ctx.req.param('userid');
    const url = `https://changba.com/wap/index.php?s=${userid}`;
    const response = await got({
        method: 'get',
        url,
        headers,
    });
    const data = response.data;
    const $ = load(data);
    const list = $('.user-work .work-info').toArray();
    const author = $('div.user-main-info > span.txt-info > a.uname').text();
    const authorimg = $('div.user-main-info > .poster > img').attr('data-src');

    let items = await Promise.all(
        list.map((item) => {
            const $ = load(item);
            const link = $('a').attr('href');
            return cache.tryGet(link, async () => {
                const result = await got({
                    method: 'get',
                    url: link,
                    headers,
                });

                const re = /workid: '\d+'/;
                let workid;
                try {
                    workid = result.data.match(re)[0];
                } catch {
                    // 没有找到该作品
                    // 这可能是由下列原因造成的：
                    // 该作品已经被原作者删除了
                    // 该作品包含了视频，目前正在审核中，在审核没有通过前无法被播放
                    // 目前服务器压力太大，刚刚上传成功的作品可能需要半个小时后才能被播放
                    return null;
                }

                workid = workid.split("'")[1];

                if (!workid) {
                    return null;
                }
                const mp3 = `https://upscuw.changba.com/${workid}.mp3`;
                const description = renderToString(<ChangbaWorkDescription desc={$('div.des').text()} mp3url={mp3} />);
                const itunes_item_image = $('div.work-cover').attr('style').replace(')', '').split('url(')[1];
                return {
                    title: $('.work-title').text(),
                    description,
                    link,
                    author,
                    itunes_item_image,
                    enclosure_url: mp3,
                    enclosure_type: 'audio/mpeg',
                };
            });
        })
    );

    items = items.filter(Boolean);

    return {
        title: author + ' - 唱吧',
        link: url,
        description: $('meta[name="description"]').attr('content') || author + ' - 唱吧',
        item: items,
        image: authorimg,
        itunes_author: author,
        itunes_category: '唱吧',
    };
}

const ChangbaWorkDescription = ({ desc, mp3url }: { desc: string; mp3url: string }) => (
    <>
        <p>{desc}</p>
        <audio id="audio" src={mp3url} preload="metadata"></audio>
    </>
);
