import { createDecipheriv, createHash } from 'node:crypto';

import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { PRESETS } from '@/utils/header-generator';

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
        headerGeneratorOptions: PRESETS.MODERN_IOS,
    });
    const data = response.data;
    const $ = load(data);
    const list = $('.user-work .work-info').toArray();
    const author = $('div.user-main-info > span.txt-info > a.uname').text();
    const authorimg = $('div.user-main-info > .poster > img').attr('data-src');

    const items: Array<DataItem | null> = await Promise.all(
        list.map((item) => {
            const href = $(item).attr('href') ?? $(item).find('a').attr('href');
            const link = new URL(href!, url).href;
            return cache.tryGet<DataItem | null>(link, () => getWork(link, author));
        })
    );

    return {
        title: author + ' - 唱吧',
        link: url,
        description: $('meta[name="description"]').attr('content') || author + ' - 唱吧',
        item: items.filter((item) => item !== null),
        image: authorimg,
        itunes_author: author,
        itunes_category: '唱吧',
    };
}

interface ChangbaWork {
    enc_workpath?: string;
    enc_duetpath?: string;
    song?: { name: string };
    title?: string;
    headcontent?: string;
}

interface ChangbaResponse {
    code: number;
    message: string;
    data_type: string;
    data?: {
        userwork?: ChangbaWork;
        newuserwork?: ChangbaWork;
        enc_workpath?: string;
        enc_duetpath?: string;
        isduet?: boolean;
        workCover?: string;
        jsSecret: string;
    };
}

function decodeMedia(value: string, secret: string): string {
    const digest = createHash('md5').update(secret).digest('hex');
    const decipher = createDecipheriv('aes-128-cbc', Buffer.from(digest.slice(16)), Buffer.from(digest.slice(0, 16)));
    return decipher.update(value, 'base64', 'utf8') + decipher.final('utf8');
}

async function getWork(link: string, author: string): Promise<DataItem | null> {
    const workUrl = new URL(link);
    const encodedId = workUrl.pathname.match(/^\/s\/([^/]+)$/)?.[1];
    const workId = workUrl.pathname.match(/^\/s(\d+)$/)?.[1];
    const result = await got('https://changba.com/redirect_song_main.php', {
        searchParams: { ...Object.fromEntries(workUrl.searchParams), ...(encodedId ? { enc_workid: encodedId } : { workid: workId }), is_mobile: 1 },
        headerGeneratorOptions: PRESETS.MODERN_IOS,
    });
    const response = result.data as ChangbaResponse;
    if (response.data_type === 'redirect') {
        throw new Error(`Changba redirected the work request: ${response.message}`);
    }
    const data = response.data;
    const work = data?.userwork;
    if (response.code !== 0 || !data || !work) {
        return null;
    }
    const encryptedMedia = data.isduet ? (data.enc_duetpath ?? work.enc_duetpath) : (data.enc_workpath ?? work.enc_workpath);
    if (!encryptedMedia) {
        return null;
    }
    const mp3 = decodeMedia(encryptedMedia, data.jsSecret);
    return {
        title: work.song?.name || data.newuserwork?.song?.name || work.title || link,
        description: renderToString(<ChangbaWorkDescription desc={`${work.headcontent ? `「${work.headcontent}」` : ''}${work.title ?? ''}`} mp3url={mp3} />),
        link,
        author,
        itunes_item_image: data.workCover,
        enclosure_url: mp3,
        enclosure_type: 'audio/mpeg',
    };
}

const ChangbaWorkDescription = ({ desc, mp3url }: { desc: string; mp3url: string }) => (
    <>
        <p>{desc}</p>
        <audio id="audio" src={mp3url} preload="metadata"></audio>
    </>
);
