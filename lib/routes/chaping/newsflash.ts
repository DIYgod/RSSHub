// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'https://chaping.cn';

export default async (ctx) => {
    const newflashAPI = `${host}/api/official/information/newsflash?page=1&limit=21`;
    const response = await got(newflashAPI).json();
    const data = response.data;

    ctx.set('data', {
        title: '差评 快讯',
        link: `${host}/newsflash`,
        item:
            data &&
            data.map((item) => ({
                title: item.title,
                description: item.summary,
                pubDate: parseDate(item.time_publish_timestamp * 1000),
                link: item.origin_url,
            })),
    });
};
