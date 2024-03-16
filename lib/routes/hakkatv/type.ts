import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const typeMap = ['hakka', 'political', 'medical', 'local', 'international'];
const baseUrl = 'https://www.hakkatv.org.tw';
const apiUrl = 'https://api.hakkatv.org.tw';

export const route: Route = {
    path: '/news/:type?',
    categories: ['traditional-media'],
    example: '/hakkatv/news',
    parameters: { type: '新聞，見下表，留空為全部' },
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
            source: ['hakkatv.org.tw/news'],
            target: '/news',
        },
    ],
    name: '新聞首頁',
    maintainers: ['TonyRL'],
    handler,
    url: 'hakkatv.org.tw/news',
    description: `| 客家焦點 | 政經要聞  | 民生醫療 | 地方風采 | 國際萬象      |
  | -------- | --------- | -------- | -------- | ------------- |
  | hakka    | political | medical  | local    | international |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    const allData = type
        ? (
              await got(`${apiUrl}/api/news/index`, {
                  searchParams: {
                      per: 4,
                      'sort[created_at]': 'desc',
                      type,
                      keywords: '',
                  },
              })
          ).data.data
        : await Promise.all(
              typeMap.map(async (t) => {
                  const { data } = await got(`${apiUrl}/api/news/index`, {
                      searchParams: {
                          per: 4,
                          'sort[created_at]': 'desc',
                          type: t,
                          keywords: '',
                      },
                  });
                  return data.data;
              })
          );

    const list = allData.flat().map((item) => ({
        title: item.title,
        pubDate: timezone(parseDate(item.created_at), +8),
        author: item.author,
        link: `${baseUrl}/news-detail/${item.id}`,
        id: item.id,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(`${apiUrl}/api/news/read/${item.id}`);
                item.category = data.tag.map((t) => t.tag);
                item.description = data.content.replaceAll('\n', '<br>');
                delete item.id;
                return item;
            })
        )
    );

    return {
        title: '新聞首頁 - 客家電視台',
        description: '客家電視是屬於全民、以至於全世界客家族群的頻道，亦是為傳播客家文化而存在，定位為「全體客家族群之媒體」。',
        link: `${baseUrl}/news`,
        language: 'zh-TW',
        item: items,
    };
}
