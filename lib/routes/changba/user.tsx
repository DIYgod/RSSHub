import { load } from 'cheerio';
import CryptoJS from 'crypto-js';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const headers = { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' };
const AES_KEY = 'a17fe74e421c2cbf3dc323f4b4f3a1af';

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

                const match = result.data.match(/enc_workpath\s*[:=]\s*['"]([^'"]+)['"]/) || result.data.match(/["']enc_workpath["']\s*,\s*["']([^"']+)["']/);

                if (!match) {
                    return null;
                }

                const iv = CryptoJS.enc.Utf8.parse(AES_KEY.slice(0, 16));
                const key = CryptoJS.enc.Utf8.parse(AES_KEY.slice(16));
                const decrypted = CryptoJS.AES.decrypt(match[1], key, { iv, padding: CryptoJS.pad.Pkcs7 });
                const mp3Url = decrypted.toString(CryptoJS.enc.Utf8);

                if (!mp3Url) {
                    return null;
                }

                const mp3 = mp3Url.replace('http://', 'https://');
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
