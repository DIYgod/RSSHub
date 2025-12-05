import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function getData(category, id) {
    const url = `https://radio.cgtn.com/downapiRES/radio/v1/program/historyList/programId${id}_category${category}_page1.json`;
    const response = await got(url);
    return response.data;
}

function combDate(date, time) {
    // combine date and time, return a Date object
    return timezone(parseDate(date + ' ' + time), +8);
}

export const route: Route = {
    path: '/podcast/:category/:id',
    categories: ['traditional-media'],
    example: '/cgtn/podcast/ezfm/4',
    parameters: { category: '类型名', id: '播客 id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cgtn.com/podcast/column/:category/*/:id'],
        },
    ],
    name: '播客',
    maintainers: ['5upernova-heng'],
    handler,
    description: `> 类型名与播客 id 可以在播客对应的 URL 中找到
  > 如 URL \`https://radio.cgtn.com/podcast/column/ezfm/More-to-Read/4\` ，其 \`category\` 为 \`ezfm\` ，\`id\` 为 \`4\`，对应的订阅路由为 [\`/podcast/ezfm/4\`](https://rsshub.app/podcast/ezfm/4)`,
};

async function handler(ctx) {
    const { category, id } = ctx.req.param();
    const categoryMap = { ezfm: 1, other: 5 };
    const data = await getData(categoryMap[category], id);
    const items = data.data.map((item) => ({
        title: item.title,
        pubDate: combDate(item.showDate, item.time.split(' ')[0]),
        description: item.programSeries.content || item.detail,
        itunes_item_image: item.programUrl,
        itunes_duration: item.duration,
        enclosure_url: item.mediaUrl,
        enclosure_type: 'audio/mpeg',
    }));
    return {
        title: `中国环球电视网 CGTN Podcast - ${data.info}`,
        link: 'https://www.cgtn.com/radio/',
        item: items,
        description: String(data.info),
    };
}
