import { load } from 'cheerio';
import CryptoJS from 'crypto-js';
import { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
};
const AES_KEY = 'a17fe74e421c2cbf3dc323f4b4f3a1af';

// 唱吧 AES 解密函数
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
    } catch {
        return null;
    }
    return null;
}

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
    name: '用户作品',
    maintainers: ['kt286', 'xizeyoupan', 'pseudoyu'],
    handler,
};

async function handler(ctx: Context) {
    const userid = ctx.req.param('userid');
    const url = `https://changba.com/wap/index.php?s=${userid}`;
    const response = await got({
        method: 'get',
        url,
        headers,
    });

    const $ = load(response.data);
    const list = $('.user-work .work-info').toArray();
    const author = $('.uname').first().text().trim() || '唱吧用户';
    const authorimg = $('.poster img').attr('data-src');

    const items = await Promise.all(
        list.map(async (item) => {
            const workLink = $(item).attr('href');
            if (!workLink) {
                return null;
            }

            // 使用 cache.tryGet 缓存单个作品详情
            const cachedItem = await cache.tryGet(workLink, async () => {
                const res = await got({
                    method: 'get',
                    url: workLink,
                    headers,
                });
                const html = res.data;

                // 匹配加密后的音频路径
                const match = html.match(/enc_workpath\s*[:=]\s*['"]([^'"]+)['"]/) || html.match(/commonObj\.url\s*=\s*'([^']+)'/);
                if (!match) {
                    throw new Error(`Work path not found for ${workLink}`);
                }

                const realAudioUrl = decryptWorkPath(match[1]);
                if (!realAudioUrl) {
                    throw new Error(`Decryption failed for ${workLink}`);
                }

                const inner$ = load(html);
                const title = inner$('.work-title').text() || inner$('.song-name').text() || '无题作品';
                const desc = inner$('.des').text() || inner$('.song-des').text() || '';

                return {
                    title,
                    description: renderToString(<ChangbaWorkDescription desc={desc} mp3url={realAudioUrl} />),
                    link: workLink,
                    author,
                    enclosure_url: realAudioUrl,
                    enclosure_type: realAudioUrl.includes('.mp4') ? 'video/mp4' : 'audio/mpeg',
                };
            });

            // 转换缓存结果类型以兼容返回数组
            return cachedItem as {
                title: string;
                description: string;
                link: string;
                author: string;
                enclosure_url: string;
                enclosure_type: string;
            } | null;
        })
    );

    return {
        title: `${author} - 唱吧`,
        link: url,
        description: $('meta[name="description"]').attr('content') || `${author} 的唱吧作品列表`,
        item: items.filter((item): item is Exclude<typeof item, null> => item !== null),
        image: authorimg,
        itunes_author: author,
        itunes_category: '唱吧',
    };
}

const ChangbaWorkDescription = ({ desc, mp3url }: { desc: string; mp3url: string }) => (
    <>
        <p>{desc}</p>
        <audio controls src={mp3url} preload="metadata" style={{ width: '100%' }}></audio>
    </>
);
