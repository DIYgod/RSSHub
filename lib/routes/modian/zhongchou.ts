import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/zhongchou/:category?/:sort?/:status?',
    categories: ['shopping'],
    example: '/modian/zhongchou',
    parameters: { category: '分类，见下表，默认为全部', sort: '排序，见下表，默认为最新上线', status: '状态，见下表，默认为全部' },
    name: '众筹',
    maintainers: ['nczitzk'],
    description: `分类

  | 全部 | 游戏  | 动漫   | 出版       | 桌游       |
  | ---- | ----- | ------ | ---------- | ---------- |
  | all  | games | comics | publishing | tablegames |

  | 卡牌  | 潮玩模型 | 影视       | 音乐  | 活动       |
  | ----- | -------- | ---------- | ----- | ---------- |
  | cards | toys     | film-video | music | activities |

  | 设计   | 科技       | 食品 | 爱心通道 | 动物救助 |
  | ------ | ---------- | ---- | -------- | -------- |
  | design | technology | food | charity  | animals  |

  | 个人愿望 | 其他   |
  | -------- | ------ |
  | wishes   | others |

  排序

  | 最新上线  | 金额最高   | 评论最多     |
  | --------- | ---------- | ------------ |
  | top\_time | top\_money | top\_comment |

  状态

  | 全部 | 创意 | 预热    | 众筹中 | 众筹成功 |
  | ---- | ---- | ------- | ------ | -------- |
  | all  | idea | preheat | going  | success  |`,
    handler,
    radar: [
        {
            source: ['zhongchou.modian.com/:category/:sort/:status'],
        },
    ],
};

async function handler(ctx) {
    const { category = 'all', sort = 'top_time', status = 'all' } = ctx.req.param();

    const rootUrl = 'https://zhongchou.modian.com';
    const currentUrl = `${rootUrl}/${category}/${sort}/${status}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.pro_title')
        .slice(0, 12)
        .map((_, item) => {
            item = $(item).parent();

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                const startTime = detailResponse.data.match(/realtime_sync\.pro_time\('(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', '\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'\);/);

                item.pubDate = startTime === null ? Date.parse(content('.start-time h3').text() || content('h3[start_time]').attr('start_time')) : Date.parse(startTime[1]);

                item.author = content('span[data-nickname]').text();
                item.description = `<img src="${content('#big_logo').attr('src')}"><br>` + content('.center-top').html() + content('#my_back_info').html() + content('#cont_match_htmlstr').html();

                return item;
            })
        )
    );

    return {
        title: `${$('.category div span').text()} - ${$('.status div span').text()} - ${$('.sort div span').text()} - 摩点众筹`,
        link: currentUrl,
        item: items,
    };
}
