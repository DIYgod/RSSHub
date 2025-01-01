import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:sid?/:tid?',
    categories: ['new-media', 'popular'],
    example: '/medsci',
    parameters: { sid: '科室，见下表，默认为推荐', tid: '亚专业，可在对应科室页 URL 中找到，默认为该科室的全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '资讯',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
  下表为科室对应的 sid，若想获得 tid，可以到对应科室页面 URL 中寻找 \`t_id\` 字段的值，下面是一个例子：

  如 [肿瘤 - NSCLC](https://www.medsci.cn/department/details?s_id=5\&t_id=277) 的 URL 为 \`https://www.medsci.cn/department/details?s_id=5&t_id=277\`，可以看到此时 \`s_id\` 对应 \`sid\` 的值为 5， \`t_id\` 对应 \`tid\` 的值为 277，所以可以得到路由 [\`/medsci/5/277\`](https://rsshub.app/medsci/5/277)
:::

  | 心血管 | 内分泌 | 消化 | 呼吸 | 神经科 |
  | ------ | ------ | ---- | ---- | ------ |
  | 2      | 6      | 4    | 12   | 17     |

  | 传染科 | 精神心理 | 肾内科 | 风湿免疫 | 血液科 |
  | ------ | -------- | ------ | -------- | ------ |
  | 9      | 13       | 14     | 15       | 21     |

  | 老年医学 | 胃肠外科 | 血管外科 | 肝胆胰外 | 骨科 |
  | -------- | -------- | -------- | -------- | ---- |
  | 19       | 76       | 92       | 91       | 10   |

  | 普通外科 | 胸心外科 | 神经外科 | 泌尿外科 | 烧伤科 |
  | -------- | -------- | -------- | -------- | ------ |
  | 23       | 24       | 25       | 26       | 27     |

  | 整形科 | 麻醉疼痛 | 罕见病 | 康复医学 | 药械 |
  | ------ | -------- | ------ | -------- | ---- |
  | 28     | 29       | 304    | 95       | 11   |

  | 儿科 | 耳鼻咽喉 | 口腔科 | 眼科 | 政策人文 |
  | ---- | -------- | ------ | ---- | -------- |
  | 18   | 30       | 31     | 32   | 33       |

  | 营养全科 | 预防公卫 | 妇产科 | 中医科 | 急重症 |
  | -------- | -------- | ------ | ------ | ------ |
  | 34       | 35       | 36     | 37     | 38     |

  | 皮肤性病 | 影像放射 | 转化医学 | 检验病理 | 护理 |
  | -------- | -------- | -------- | -------- | ---- |
  | 39       | 40       | 42       | 69       | 79   |

  | 糖尿病 | 冠心病 | 肝病 | 乳腺癌 |
  | ------ | ------ | ---- | ------ |
  | 8      | 43     | 22   | 89     |`,
};

async function handler(ctx) {
    let sid = ctx.req.param('sid') ?? '';
    const tid = ctx.req.param('tid') ?? '';

    sid = sid === 'recommend' ? '' : sid;

    const rootUrl = 'https://www.medsci.cn';
    const currentUrl = `${rootUrl}${sid ? `/department/details?s_id=${sid}&module=article${tid ? `&t_id=${tid}` : ''}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('#articleList')
        .find('.ms-link')
        .toArray()
        .map((item) => {
            item = $(item);

            const pubDate = item.parent().parent().find('.item-meta-item').first().text();

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href').replace(/;jsessionid=[\dA-Z]+/, '')}`,
                pubDate: pubDate.indexOf('-') > 0 ? parseDate(pubDate) : parseRelativeDate(pubDate),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const pubDateMatches = detailResponse.data.match(/"publishedTime":"(.*)","publishedTimeString"/);

                item.author = content('.name').text();
                item.description = content('#content').html();
                item.pubDate = pubDateMatches ? parseDate(pubDateMatches[1]) : item.pubDate;
                item.category =
                    content('meta[name="keywords"]')
                        .attr('content')
                        ?.split(/,|，/)
                        .filter((c) => c !== '' && c !== 'undefined') ?? [];

                return item;
            })
        )
    );

    return {
        title: `${sid ? $('.department-header-active').text() : '推荐'} -${tid ? ` ${$('.department-keywords-ul .active').text()} -` : ''} MedSci.cn`,
        link: currentUrl,
        item: items,
    };
}
