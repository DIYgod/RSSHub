import { load } from 'cheerio';
import CryptoJS from 'crypto-js';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const headers = { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' };
const AES_KEY = 'a17fe74e421c2cbf3dc323f4b4f3a1af';

// 唱吧 AES 解密函数：获取直连 CDN 地址
function decryptWorkPath(str: string) {
    try {
        const iv = CryptoJS.enc.Utf8.parse(AES_KEY.substring(0, 16));
        const key = CryptoJS.enc.Utf8.parse(AES_KEY.substring(16));
        const decrypted = CryptoJS.AES.decrypt(str, key, { iv, padding: CryptoJS.pad.Pkcs7 });
        let url = decrypted.toString(CryptoJS.enc.Utf8);
        if (url) {
            url = url.startsWith('http') ? url : `https:${url}`;
            return url.replace('http://', 'https://');
        }
    } catch (e) {
        return null;
    }
    return null;
}

export const route: Route = {
    path: '/:userid',
    categories: ['social-media'],
    view: ViewType.Audios,
    example: '/changba/skp6hhF59n48R-UpqO3izw',
    parameters: { userid: '用户ID' },
    features: {
        supportPodcast: true, // 开启播客支持以增强 Telegram 媒体识别
    },
    name: '用户作品',
    maintainers: ['kt286', 'xizeyoupan', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const userid = ctx.req.param('userid');
    const url = `https://changba.com/wap/index.php?s=${userid}`;
    const response = await got({ method: 'get', url, headers });

    const $ = load(response.data);
    const list = $('.user-work .work-info').toArray();
    const author = $('.uname').first().text().trim() || '唱吧用户';
    const authorimg = $('.poster img').attr('data-src');

    let items = await Promise.all(
        list.map((item) => {
            const workLink = $(item).attr('href');
            if (!workLink) return null;

            return cache.tryGet(workLink, async () => {
                const res = await got({ method: 'get', url: workLink, headers });
                const html = res.data;

                // 核心修复：匹配并解密真实的音频地址
                const match = html.match(/enc_workpath\s*[:=]\s*['"]([^'"]+)['"]/) || html.match(/commonObj\.url\s*=\s*'([^']+)'/);
                if (!match) return null;

                const realAudioUrl = decryptWorkPath(match[1]);
                if (!realAudioUrl) return null;

                const inner$ = load(html);
                const title = inner$('.work-title').text() || inner$('.song-name').text() || '无题';
                const desc = inner$('.des').text() || inner$('.song-des').text() || '';

                return {
                    title: title,
                    description: renderToString(<ChangbaWorkDescription desc={desc} mp3url={realAudioUrl} />),
                    link: workLink,
                    author: author,
                    // enclosure 是让 Telegram 识别为媒体的关键
                    enclosure_url: realAudioUrl,
                    enclosure_type: realAudioUrl.includes('.mp4') ? 'video/mp4' : 'audio/mpeg',
                    itunes_item_image: authorimg,
                };
            });
        })
    );

    return {
        title: `${author} - 唱吧`,
        link: url,
        description: $('meta[name="description"]').attr('content') || `${author} 的唱吧主页`,
        item: items.filter(Boolean),
        image: authorimg,
        itunes_author: author,
    };
}

const ChangbaWorkDescription = ({ desc, mp3url }: { desc: string; mp3url: string }) => (
    <>
        <p>{desc}</p>
        <audio src={mp3url} controls preload="metadata"></audio>
    </>
);
