import { load } from 'cheerio';
import CryptoJS from 'crypto-js';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const headers = { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' };
const AES_KEY = 'a17fe74e421c2cbf3dc323f4b4f3a1af';

// 格式化日期 (yyyy.mm.dd)，确保与你的 JS 脚本一致
function formatTime(dateStr: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `(${y}.${m}.${d})`;
}

// 核心解密逻辑
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
    features: { supportPodcast: true },
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

                const match = html.match(/enc_workpath\s*[:=]\s*['"]([^'"]+)['"]/) || html.match(/commonObj\.url\s*=\s*'([^']+)'/);
                if (!match) return null;

                const realAudioUrl = decryptWorkPath(match[1]);
                if (!realAudioUrl) return null;

                const inner$ = load(html);
                const songName = inner$('.work-title').text() || inner$('.song-name').text() || '作品';
                const desc = (inner$('.des').text() || inner$('.song-des').text() || '').trim();
                const timeTag = formatTime(inner$('.time').text());

                // 1. 严格清洗标题：去除换行、回车、制表符，防止 URL 编码污染
                const cleanTitle = `${timeTag}${author} - ${songName}${desc ? ' - ' + desc : ''}`
                    .replace(/[\r\n\t]/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .replace(/[\\/:*?"<>|]/g, '_');

                // 2. 路径伪装修复：将自定义文件名插入到查询参数之前，形成 .../id.mp3/自定义名.mp3?sign=...
                // 这种结构能让 Telegram 机器人最稳定地识别出文件名
                const urlParts = realAudioUrl.split('?');
                const baseUrl = urlParts[0];
                const queryArgs = urlParts[1] || '';
                const finalEnclosureUrl = `${baseUrl}/${encodeURIComponent(cleanTitle)}.mp3?${queryArgs}`;

                return {
                    title: cleanTitle,
                    description: renderToString(<ChangbaWorkDescription desc={desc} mp3url={realAudioUrl} />),
                    link: workLink,
                    author: author,
                    enclosure_url: finalEnclosureUrl,
                    enclosure_type: 'audio/mpeg',
                    itunes_item_image: authorimg,
                };
            });
        })
    );

    return {
        title: `${author} - 唱吧`,
        link: url,
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
