import { load } from 'cheerio';
import CryptoJS from 'crypto-js';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const headers = { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' };
const AES_KEY = 'a17fe74e421c2cbf3dc323f4b4f3a1af';

/**
 * 唱吧 AES 解密函数
 * 用于从页面加密字符串中获取真实的 CDN 音频地址
 */
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

async function handler(ctx) {
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
    const authorimg = $('.poster img').attr('data-src') || $('.poster img').attr('src');

    let items = await Promise.all(
        list.map((item) => {
            const workLink = $(item).attr('href');
            if (!workLink) return null;

            return cache.tryGet(workLink, async () => {
                const res = await got({
                    method: 'get',
                    url: workLink,
                    headers,
                });
                const html = res.data;

                // 匹配加密后的音频路径
                const match = html.match(/enc_workpath\s*[:=]\s*['"]([^'"]+)['"]/) || html.match(/commonObj\.url\s*=\s*'([^']+)'/);
                if (!match) return null;

                const realAudioUrl = decryptWorkPath(match[1]);
                if (!realAudioUrl) return null;

                const inner$ = load(html);
                const title = inner$('.work-title').text() || inner$('.song-name').text() || '无题作品';
                const desc = inner$('.des').text() || inner$('.song-des').text() || '';

                // 提取作品封面图，用于 RSS 预览
                let coverImg = inner$('.work-cover')
                    .attr('style')
                    ?.match(/url\(['"]?(.*?)['"]?\)/)?.[1];
                if (!coverImg) {
                    coverImg = inner$('.poster img').attr('src') || authorimg;
                }

                return {
                    title: title,
                    // 使用自定义组件渲染更美观的描述页
                    description: renderToString(<ChangbaWorkDescription desc={desc} mp3url={realAudioUrl} cover={coverImg} />),
                    link: workLink,
                    author,
                    itunes_item_image: coverImg,
                    enclosure_url: realAudioUrl,
                    enclosure_type: realAudioUrl.includes('.mp4') ? 'video/mp4' : 'audio/mpeg',
                };
            });
        })
    );

    return {
        title: `${author} - 唱吧`,
        link: url,
        description: $('meta[name="description"]').attr('content') || `${author} 的唱吧作品集`,
        item: items.filter(Boolean),
        image: authorimg,
        itunes_author: author,
        itunes_category: 'Music',
    };
}

/**
 * 美化后的描述组件
 * 增加封面展示，优化播放器布局
 */
const ChangbaWorkDescription = ({ desc, mp3url, cover }: { desc: string; mp3url: string; cover?: string }) => (
    <div style="font-family: sans-serif;">
        {cover && (
            <div style="margin-bottom: 15px;">
                <img src={cover} style="width: 100%; max-width: 400px; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
            </div>
        )}
        <p style="font-size: 16px; color: #333; line-height: 1.5; margin-bottom: 15px;">{desc}</p>
        <div style="background: #f4f4f4; padding: 10px; border-radius: 8px;">
            <audio controls src={mp3url} preload="metadata" style="width: 100%;"></audio>
        </div>
        <p style="font-size: 12px; color: #999; margin-top: 10px;">温馨提示：如果无法播放，请尝试在浏览器中打开链接</p>
    </div>
);
