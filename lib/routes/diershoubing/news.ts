// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
const renderDesc = (data) => art(path.join(__dirname, 'templates/news.art'), data);

export default async (ctx) => {
    const { data } = await got(`https://api.diershoubing.com:5001/feed/tag/?pn=0&rn=${ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20}&tag_type=0&src=ios`);

    const items = data.feeds.map((item) => {
        let acontent;
        let type;
        if (item.video_img && item.video_type === 'bilibili') {
            acontent = { img: item.video_img, bvid: item.video_url.replace('https://www.bilibili.com/video/', '').replace('/', '') };
            type = 'bilibili';
        } else if (item.acontent.startsWith('{')) {
            const contentData = JSON.parse(item.acontent);
            if (contentData.imgs) {
                acontent = contentData.imgs.split(',');
                type = 'imgs';
            } else {
                acontent = { img: contentData.video.split('|')[0], bvid: contentData.video.split('|')[1].replace('https://www.bilibili.com/video/', '') };
                type = 'bilibili';
            }
        } else {
            acontent = item.acontent.split(',');
            type = 'imgs';
        }

        return {
            title: item.title,
            link: item.share.url,
            description: renderDesc({
                description: item.content.replaceAll('\r\n', '<br>'),
                type,
                acontent,
            }),
            category: item.feed_type,
            author: item.create_nick_name,
            pubDate: parseDate(item.create_time),
        };
    });

    ctx.set('data', {
        title: `二柄APP`,
        link: `https://www.diershoubing.com`,
        description: `二柄APP新闻`,
        item: items,
    });
};
