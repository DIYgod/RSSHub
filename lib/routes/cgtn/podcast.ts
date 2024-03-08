import { Route } from '@/types';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

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
    categories: ['bbs'],
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
    radar: {
        source: ['cgtn.com/podcast/column/:category/*/:id'],
    },
    name: '播客',
    maintainers: ['5upernova-heng'],
    handler,
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
