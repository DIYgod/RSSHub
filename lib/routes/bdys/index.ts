import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';
import path from 'node:path';
import asyncPool from 'tiny-async-pool';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

// Visit https://www.bdys.me for the list of domains
const allowDomains = new Set(['52bdys.com', 'bde4.icu', 'bdys01.com']);

export const route: Route = {
    path: '/:caty?/:type?/:area?/:year?/:order?',
    categories: ['multimedia'],
    example: '/bdys',
    parameters: {
        caty: '影视类型，见下表，默认为 `all` 即不限',
        type: '资源分类，见下表，默认为 `all` 即不限',
        area: '制片地区，见下表，默认为 `all` 即不限',
        year: '上映时间，此处填写年份不小于2000，默认为 `all` 即不限',
        order: '影视排序，见下表，默认为更新时间',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '首页',
    maintainers: ['nczitzk'],
    handler,
    description: `#### 资源分类

  | 不限 | 电影 | 电视剧 |
  | ---- | ---- | ------ |
  | all  | 0    | 1      |

  #### 影视类型

  | 不限 | 动作    | 爱情   | 喜剧 | 科幻   | 恐怖   |
  | ---- | ------- | ------ | ---- | ------ | ------ |
  | all  | dongzuo | aiqing | xiju | kehuan | kongbu |

  | 战争      | 武侠  | 魔幻   | 剧情   | 动画    | 惊悚     |
  | --------- | ----- | ------ | ------ | ------- | -------- |
  | zhanzheng | wuxia | mohuan | juqing | donghua | jingsong |

  | 3D | 灾难   | 悬疑   | 警匪    | 文艺  | 青春     |
  | -- | ------ | ------ | ------- | ----- | -------- |
  | 3D | zainan | xuanyi | jingfei | wenyi | qingchun |

  | 冒险    | 犯罪   | 纪录 | 古装     | 奇幻   | 国语  |
  | ------- | ------ | ---- | -------- | ------ | ----- |
  | maoxian | fanzui | jilu | guzhuang | qihuan | guoyu |

  | 综艺   | 历史  | 运动    | 原创压制   |
  | ------ | ----- | ------- | ---------- |
  | zongyi | lishi | yundong | yuanchuang |

  | 美剧  | 韩剧  | 国产电视剧 | 日剧 | 英剧   | 德剧 |
  | ----- | ----- | ---------- | ---- | ------ | ---- |
  | meiju | hanju | guoju      | riju | yingju | deju |

  | 俄剧 | 巴剧 | 加剧  | 西剧    | 意大利剧 | 泰剧  |
  | ---- | ---- | ----- | ------- | -------- | ----- |
  | eju  | baju | jiaju | spanish | yidaliju | taiju |

  | 港台剧    | 法剧 | 澳剧 |
  | --------- | ---- | ---- |
  | gangtaiju | faju | aoju |

  #### 制片地区

  | 大陆 | 中国香港 | 中国台湾 |
  | ---- | -------- | -------- |

  | 美国 | 英国 | 日本 | 韩国 | 法国 |
  | ---- | ---- | ---- | ---- | ---- |

  | 印度 | 德国 | 西班牙 | 意大利 | 澳大利亚 |
  | ---- | ---- | ------ | ------ | -------- |

  | 比利时 | 瑞典 | 荷兰 | 丹麦 | 加拿大 | 俄罗斯 |
  | ------ | ---- | ---- | ---- | ------ | ------ |

  #### 影视排序

  | 更新时间 | 豆瓣评分 |
  | -------- | -------- |
  | 0        | 1        |`,
};

async function handler(ctx) {
    const caty = ctx.req.param('caty') || 'all';
    const type = ctx.req.param('type') || 'all';
    const area = ctx.req.param('area') || 'all';
    const year = ctx.req.param('year') || 'all';
    const order = ctx.req.param('order') || '0';

    const site = ctx.req.query('domain') || 'bdys01.com';
    if (!config.feature.allow_user_supply_unsafe_domain && !allowDomains.has(new URL(`https://${site}`).hostname)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const rootUrl = `https://www.${site}`;
    const currentUrl = `${rootUrl}/s/${caty}?${type === 'all' ? '' : '&type=' + type}${area === 'all' ? '' : '&area=' + area}${year === 'all' ? '' : '&year=' + year}&order=${order}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let jsessionid = '';

    const list = $('.card-body .card a')
        .slice(0, 15)
        .toArray()
        .map((item) => {
            item = $(item);
            const link = item.attr('href').split(';jsessionid=');
            jsessionid = link[1];
            const next = item.next();
            return {
                title: next.find('h3').text(),
                link: `${rootUrl}${link[0]}`,
                pubDate: parseDate(next.find('.text-muted').text()),
            };
        });

    const headers = {
        cookie: `JSESSIONID=${jsessionid}`,
    };

    const items = [];

    for await (const data of asyncPool(1, list, (item) =>
        cache.tryGet(item.link, async () => {
            const detailResponse = await got({
                method: 'get',
                url: item.link,
                headers,
            });
            const downloadResponse = await got({
                method: 'get',
                url: `${rootUrl}/downloadInfo/list?mid=${item.link.split('/')[4].split('.')[0]}`,
                headers,
            });
            const content = load(detailResponse.data);

            content('svg').remove();
            const torrents = content('.download-list .list-group');

            item.description = art(path.join(__dirname, 'templates/desc.art'), {
                info: content('.row.mt-3').html(),
                synopsis: content('#synopsis').html(),
                links: downloadResponse.data,
                torrents: torrents.html(),
            });

            item.pubDate = timezone(parseDate(content('.bg-purple-lt').text().replace('更新时间：', '')), +8);
            item.guid = `${item.link}#${content('.card h1').text()}`;

            item.enclosure_url = torrents.html() ? `${rootUrl}${torrents.find('a').first().attr('href')}` : downloadResponse.data.pop().url;
            item.enclosure_type = 'application/x-bittorrent';

            return item;
        })
    )) {
        items.push(data);
    }

    return {
        title: '哔嘀影视',
        link: currentUrl,
        item: items,
    };
}
