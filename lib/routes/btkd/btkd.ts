import got from '@/utils/got';
import * as cheerio from 'cheerio';
import type { Context } from 'koa';

interface Episode {
    title: string;
    description: string;
    link: string;
    enclosure_url?: string;
    enclosure_type?: string;
    pubDate?: string;
    itunes_duration?: string;
}

const handler = async (ctx: Context) => {
    const url = 'https://www.xiaoyuzhoufm.com/podcast/664f1ae6aa419b1eeb6056b6';
    const { data: html } = await got(url);
    const $ = cheerio.load(html);

    // 节目基本信息
    const title = $('title').text().replace(/ - 小宇宙.*/, '') || '半天空档';
    const description = $('meta[name="description"]').attr('content') || '';

    // 节目列表解析
    const items: Episode[] = [];
    $('ul.tab a.card').each((_, el) => {
        const $el = $(el);
        const epUrl = 'https://www.xiaoyuzhoufm.com' + $el.attr('href');
        const epTitle = $el.find('.title').text().trim();
        const epDesc = $el.find('.description p').text().trim();
        const epCover = $el.find('img').attr('src');
        const epDuration = $el.text().match(/\d+分钟/)?.[0] || '';
        const epPubDate = $el.find('time').attr('datetime');
        items.push({
            title: epTitle,
            description: epDesc,
            link: epUrl,
            enclosure_url: epCover,
            enclosure_type: 'image/jpeg',
            pubDate: epPubDate,
            itunes_duration: epDuration,
        });
    });

    ctx.state.data = {
        title,
        link: url,
        description,
        item: items,
    };
};

export default handler;