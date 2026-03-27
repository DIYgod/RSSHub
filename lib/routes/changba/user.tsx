import { load } from 'cheerio';
import CryptoJS from 'crypto-js';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const headers = { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' };
const AES_KEY = 'a17fe74e421c2cbf3dc323f4b4f3a1af'; //

// 格式化日期逻辑，与 JS 脚本保持一致
function formatTime(dateStr: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `(${y}.${m}.${d})`;
}

// 核心解密算法
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

                // 解密真实地址
                const match = html.match(/enc_workpath\s*[:=]\s*['"]([^'"]+)['"]/) || html.match(/commonObj\.url\s*=\s*'([^']+)'/);
                if (!match) return null;

                const realAudioUrl = decryptWorkPath(match[1]);
                if (!realAudioUrl) return null;

                const inner$ = load(html);
                const songName = inner$('.work-title').text() || inner$('.song-name').text() || '作品';
                const desc = inner$('.des').text() || inner$('.song-des').text() || '';
                const timeTag = formatTime(inner$('.time').text());

                // 文件名格式
                const prettyFileName = `${timeTag}${author} - ${songName}${desc ? ' - ' + desc.substring(0, 20) : ''}`.replace(/[\\/:*?"<>|]/g, '_');

                // 在 URL 结尾通过查询参数注入文件名，Telegram 会读取这个部分作为文件名显示
                const finalMediaUrl = `${realAudioUrl}&filename=/${encodeURIComponent(prettyFileName)}.mp3`;

                return {
                    title: prettyFileName,
                    description: renderToString(<ChangbaWorkDescription desc={desc} mp3url={realAudioUrl} />),
                    link: workLink,
                    author: author,
                    enclosure_url: finalMediaUrl, // 使用注入了文件名的 URL
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
    };
}

const ChangbaWorkDescription = ({ desc, mp3url }: { desc: string; mp3url: string }) => (
    <>
        <p>{desc}</p>
        <audio src={mp3url} controls preload="metadata"></audio>
    </>
);
