import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://e.ecust.edu.cn';

export const route: Route = {
    path: '/jxjy/news',
    categories: ['university'],
    example: '/ecust/jxjy/news',
    parameters: {},
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
            source: ['e.ecust.edu.cn/engine2/m/38F638B77773ADD3', 'e.ecust.edu.cn/'],
        },
    ],
    name: '继续教育学院 - 学院公告',
    maintainers: ['jialinghui'],
    handler,
    url: 'e.ecust.edu.cn/engine2/m/38F638B77773ADD3',
};

async function handler() {
    const { data: response } = await got.post(`${baseUrl}/engine2/general/1301/type/more-datas`, {
        form: {
            engineInstanceId: 1_732_458,
            pageNum: 1,
            pageSize: 20,
            typeId: 4_562_497,
            topTypeId: '',
            sw: '',
        },
    });

    const list = response.data.datas.datas.map((item) => ({
        title: item['1'].value,
        link: item.url.startsWith('http') ? item.url : `${baseUrl}/engine2/d/${item.id}/${item.engineInstanceId}/0`,
        pubDate: timezone(parseDate(item['6'].value), +8),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.includes('toPhoneSign')) {
                    return item;
                }
                const { data: response } = await got(item.link);
                item.description = JSON.parse(response.match(/"content":(".*")(?:,"sequence":\d+)?,"typePath"/)[1]);
                return item;
            })
        )
    );

    return {
        title: '华东理工继续教育学院',
        description: '学院公告',
        link: `${baseUrl}/engine2/m/38F638B77773ADD3`,
        item: items,
    };
}
