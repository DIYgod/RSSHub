import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import ofetch from '@/utils/ofetch';
import path from 'node:path';
import { art } from '@/utils/render';
const renderDescription = (desc) => art(path.join(__dirname, 'templates/scheduleDesc.art'), desc);
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

export const route: Route = {
    path: '/schedules/:serie?/:category?',
    parameters: {
        serie: 'Love Live! Series sub-projects abbreviation, see the following table',
        category: 'The official website lists the categories, see the following table for details',
    },
    name: 'Schedule',
    example: '/lovelive-anime/schedules',
    categories: ['anime'],
    maintainers: ['axojhf'],
    handler,
    description: `| Sub-project Name (not full name) | 全シリーズ              | Lovelive!  | Lovelive! Sunshine!! | Lovelive! Nijigasaki High School Idol Club | Lovelive! Superstar!! | ラブライブ！スクールアイドルミュージカル |
| -------------------------------- | ----------------------- | ---------- | -------------------- | ------------------------------------------ | --------------------- | ---------------------------------------- |
| \`serie\` parameter                | *No parameter* or \`all\` | \`lovelive\` | \`sunshine\`           | \`nijigasaki\`                               | \`superstar\`           | \`musical\`                                |

| Category Name        | 全て                    | ライブ | イベント | 生配信    |
| -------------------- | ----------------------- | ------ | -------- | --------- |
| \`category\` parameter | *No parameter* or \`all\` | \`live\` | \`event\`  | \`haishin\` |`,
};

async function handler(ctx) {
    const { serie = 'all', category = 'all' } = ctx.req.param();
    const rootUrl = 'https://www.lovelive-anime.jp/common/api/calendar_list.php';
    const nowTime = dayjs();
    const dataPara = {
        year: nowTime.year(),
        month: nowTime.format('MM'),
    };
    if (serie && 'all' !== serie) {
        dataPara.series = [serie];
    }
    if (category && 'all' !== category) {
        dataPara.category = [category];
    }
    const response = await ofetch(`${rootUrl}?site=jp&ip=lovelive&data=${encodeURIComponent(JSON.stringify(dataPara))}`);

    const items = response.data.schedule_list.map((item) => {
        const link = item.url.select_url;
        const title = item.title;
        const category = item.categories.name;
        const eventStartDate = dayjs.unix(item.event_startdate).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss JST');
        const eventEndDate = dayjs.unix(item.event_enddate).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss JST');

        return {
            link,
            pubDate: item.start_endflg ? dayjs.unix(item.event_enddate).tz('Asia/Tokyo') : dayjs.unix(item.event_startdate).tz('Asia/Tokyo'),
            title,
            category,
            description: renderDescription({
                desc: item.event_dspdate,
                startTime: eventStartDate,
                endTime: eventEndDate,
            }),
        };
    });

    return {
        title: `${category} - ${serie} - Love Live Official Website Schedule`,
        link: 'https://www.lovelive-anime.jp/schedule/',
        item: items,
        description:
            'The schedule date and other information shall be subject to the announcement on the official website. The RSS route has not been strictly tested, and the captured information cannot be guaranteed to be correct.',
    };
}
