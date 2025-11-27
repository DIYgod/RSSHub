import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/channel/:id?',
    categories: ['forecast'],
    example: '/cma/channel/380',
    parameters: { id: '分类，见下表，可在对应频道页 URL 中找到，默认为 380，即每日天气提示' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '天气预报频道',
    maintainers: ['nczitzk'],
    handler,
    description: `#### 天气实况

| 频道名称 | 频道 id                          |
| -------- | -------------------------------- |
| 卫星云图 | d3236549863e453aab0ccc4027105bad |
| 单站雷达 | 103                              |
| 降水量   | 18                               |
| 气温     | 32                               |
| 土壤水分 | 45                               |

#### 气象公报

| 频道名称       | 频道 id                          |
| -------------- | -------------------------------- |
| 每日天气提示   | 380                              |
| 重要天气提示   | da5d55817ad5430fb9796a0780178533 |
| 天气公报       | 3780                             |
| 强对流天气预报 | 383                              |
| 交通气象预报   | 423                              |
| 森林火险预报   | 424                              |
| 海洋天气公报   | 452                              |
| 环境气象公报   | 467                              |

::: tip
  订阅更多细分频道，请前往对应上级频道页，使用下拉菜单选择项目后跳转到目标频道页，查看其 URL 找到对应频道 id
:::`,
};

async function handler(ctx) {
    const { id = '380' } = ctx.req.param();

    const author = '中国气象局·天气预报';
    const rootUrl = 'https://weather.cma.cn';
    const apiUrl = new URL('api/channel', rootUrl).href;
    const currentUrl = new URL(`web/channel-${id}.html`, rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            id,
        },
    });

    const data = response?.data?.pop() ?? {};

    data.image = data.image?.replace(/\?.*$/, '') ?? undefined;

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = [
        ...new Set(
            $('ol#breadcrumb li')
                .slice(1)
                .toArray()
                .map((li) => $(li).text())
        ),
    ].join(' > ');
    const description = $('div.xml').html();
    const image = new URL($('li.active a img').prop('src'), rootUrl).href;
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    const items = data
        ? [
              {
                  title: `${data.title} ${data.releaseTime}`,
                  link: new URL(data.link, rootUrl).href,
                  description: art(path.join(__dirname, 'templates/description.art'), {
                      description,
                      image: data.image
                          ? {
                                src: new URL(data.image, rootUrl).href,
                                alt: data.title,
                            }
                          : undefined,
                  }),
                  author:
                      $(
                          $('div.col-xs-8 span')
                              .toArray()
                              .filter((a) => $(a).text().startsWith('来源'))
                              ?.pop()
                      )
                          ?.text()
                          ?.split(/：/)
                          ?.pop() || author,
                  guid: `cma${data.link}#${data.releaseTime.replaceAll(/\s/g, '-')}`,
                  pubDate: timezone(parseDate(data.releaseTime), +8),
                  enclosure_url: new URL(data.image, rootUrl).href,
                  enclosure_type: data.image ? `image/${data.image.split(/\./).pop()}` : undefined,
              },
          ]
        : [];

    return {
        item: items,
        title: `${author} - ${title}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
        allowEmpty: true,
    };
}
