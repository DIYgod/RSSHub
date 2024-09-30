import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/cx/:category?/:city?',
    categories: ['shopping'],
    example: '/tesla/cx/生活方式/北京',
    parameters: { category: '分类，见下表，默认为空，即全部', city: '城市，默认为空，即全国' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '权益中心',
    maintainers: ['simonsmh', 'nczitzk'],
    handler,
    description: `| 充电免停 | 酒店 | 美食 | 生活方式 |
  | -------- | ---- | ---- | -------- |

  :::tip
  分类为 **充电免停** 时，城市参数不起作用
  :::

  <details>
    <summary>可选城市</summary>

    | 成都 | 深圳 | 洛阳 | 北京 | 南京 | 绍兴 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 西安 | 上海 | 阿坝藏族羌族自治州 | 重庆 | 郑州 | 天津 |
    | ---- | ---- | ------------------ | ---- | ---- | ---- |

    | 晋中 | 三亚 | 湖州 | 苏州 | 扬州 | 秦皇岛 |
    | ---- | ---- | ---- | ---- | ---- | ------ |

    | 长沙 | 武汉 | 安阳 | 温州 | 瑞安 | 石家庄 |
    | ---- | ---- | ---- | ---- | ---- | ------ |

    | 佛山 | 广州 | 杭州 | 烟台 | 沧州 | 张家港 |
    | ---- | ---- | ---- | ---- | ---- | ------ |

    | 金华 | 临沧 | 大理 | 南昌 | 贵阳 | 信阳 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 张家口 | 铜仁 | 沈阳 | 合肥 | 黔东 | 高邮 |
    | ------ | ---- | ---- | ---- | ---- | ---- |

    | 三河 | 安顺 | 莆田 | 阳江 | 南宁 | 台州 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 余姚 | 淄博 | 三明 | 中山 | 宁波 | 厦门 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 永康 | 慈溪 | 台山 | 福州 | 无锡 | 宜昌 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 泉州 | 肇庆 | 太仓 | 珠海 | 邢台 | 衡水 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 温岭 | 宜兴 | 东莞 | 威海 | 南通 | 舟山 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 都匀 | 长治 | 江阴 | 云浮 | 常州 | 唐山 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 平湖 | 商丘 | 保定 | 泰州 | 青岛 | 龙口 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 泰安 | 岳阳 | 惠州 | 徐州 | 哈尔滨 | 潍坊 |
    | ---- | ---- | ---- | ---- | ------ | ---- |

    | 大同 | 嘉兴 | 毕节 | 临汾 | 江门 | 诸暨 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 儋州 | 衢州 | 大连 | 昆山 | 靖江 | 常熟 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 罗定 | 丽江 | 晋江 | 乐清 | 茂名 | 福清 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 廊坊 | 兰溪 | 汕尾 | 滨州 | 昆明 | 玉环 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 绵阳 | 漳州 | 德州 | 聊城 | 龙岩 | 临沂 |
    | ---- | ---- | ---- | ---- | ---- | ---- |

    | 新沂 | 桐乡 | 迪庆藏族自治州 | 汕头 | 潮州 | 驻马店 |
    | ---- | ---- | -------------- | ---- | ---- | ------ |

    | 曲阜 | 郴州 | 济源 | 兴义 |
    | ---- | ---- | ---- | ---- |
  </details>`,
};

async function handler(ctx) {
    const { category, city } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const rootUrl = 'https://cx.tesla.cn';
    const rootApiUrl = 'https://community-api.tesla.cn';
    const rootMediaApi = 'https://china-community-app.tesla.cn';

    const currentUrl = new URL(`user-right/list${category ? `/${category}` : ''}`, rootUrl).href;
    const apiUrl = new URL('api/voucherpackage/merchant', rootApiUrl).href;
    const apiCategoryUrl = new URL('api/category', rootApiUrl).href;

    const categoryToUrl = (category) => new URL(`user-right/list/${category}`, rootUrl).href;
    const mediaToUrl = (media) => new URL(`community-media/${media}`, rootMediaApi).href;

    art.defaults.imports.categoryToUrl = categoryToUrl;
    art.defaults.imports.mediaToUrl = mediaToUrl;

    const { data: categoryResponse } = await got(apiCategoryUrl, {
        searchParams: {
            type: 2,
        },
    });

    const categoryObject = categoryResponse.data.findLast((c) => c.name === category);

    const { data: response } = await got(apiUrl, {
        searchParams: {
            pageSize: limit,
            pageNumber: 0,
            benefitCategoryId: categoryObject?.id ?? undefined,
            category: categoryObject ? undefined : category === '充电免停' ? 2 : undefined,
            city,
        },
    });

    let items = response.data.pageDatas.slice(0, limit).map((item) => ({
        title: item.venueName ?? item.title,
        link: new URL(`user-right/detail/${item.id}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            image: item.coverImage
                ? {
                      src: item.coverImage,
                      alt: item.venueName ?? item.title,
                  }
                : undefined,
            description: item.description?.replace(/\["|"]/g, '') ?? undefined,
            data: item.parkingLocationId
                ? {
                      title: item.venueName ?? item.title,
                      categories: [category],
                      description: `充电停车减免${item.parkingVoucherValue}小时`,
                  }
                : undefined,
        }),
        category: item.categories,
        guid: item.id,
        pubDate: parseDate(item.publishedAt),
        parkingLocationId: item.parkingLocationId,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.parkingLocationId) {
                    item.guid = `tesla-user-right#${item.guid}`;

                    delete item.parkingLocationId;

                    return item;
                }

                const apiItemUrl = new URL(`api/voucherpackage/merchant/${item.guid}`, rootApiUrl).href;

                const { data: detailResponse } = await got(apiItemUrl);

                const data = detailResponse.data;

                item.title = data.title ?? item.title;
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    data,
                });
                item.author = data.merchants ? data.merchants.map((a) => a.name).join('/') : undefined;
                item.category = [...new Set([...item.category, ...data.categories])].filter(Boolean);
                item.guid = `tesla-user-right#${item.guid}`;

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const author = $('title').text();
    const description = `${city ?? ''}${category ?? ''}`;
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: `${author}权益中心${description ? ` - ${description}` : ''}`,
        link: currentUrl,
        description,
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: description,
        author,
        allowEmpty: true,
    };
}
