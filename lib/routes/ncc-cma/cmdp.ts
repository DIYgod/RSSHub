import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import iconv from 'iconv-lite';

export const handler = async (ctx) => {
    const { id = 'RPJQWQYZ' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const ids = id?.split(/\//) ?? [];
    const titles = [];

    const rootUrl = 'http://cmdp.ncc-cma.net';
    const currentUrl = new URL('cn/index.htm', rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response, 'gbk'));

    const author = '国家气候中心';
    const language = 'zh';

    const items = $('ul.img-con-new-con li img[id]')
        .toArray()
        .filter((item) => ids.length === 0 || ids.includes($(item).prop('id')))
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const id = item.prop('id');
            const title = $(`li[data-id="${id}"]`).text() || undefined;
            const image = new URL(item.prop('src'), currentUrl).href;
            const date =
                image
                    .match(/_(\d{4})(\d{2})(\d{2})_/)
                    ?.slice(1, 4)
                    .join('-') ?? new Date().toISOString().slice(0, 10);

            if (ids.length !== 0 && title) {
                titles.push(title);
            }

            const description = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: `${title} ${date}`,
                          },
                      ]
                    : undefined,
            });
            const guid = `ncc-cma#${id}#${date}`;

            return {
                title: `${title} ${date}`,
                description,
                pubDate: parseDate(date),
                link: currentUrl,
                category: [title],
                author,
                guid,
                id: guid,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                language,
                enclosure_url: image,
                enclosure_type: `image/${image.split(/\./).pop()}`,
                enclosure_title: `${title} ${date}`,
            };
        });

    const subtitle = $('h1').last().text();
    const image = $('img.logo').prop('src');

    return {
        title: `${author} - ${subtitle}${titles.length === 0 ? '' : ` - ${titles.join('|')}`}`,
        description: $('title').text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
        language,
    };
};

export const route: Route = {
    path: '/cmdp/image/:id{.+}?',
    name: '最新监测',
    url: 'cmdp.ncc-cma.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/ncc-cma/cmdp/image/RPJQWQYZ',
    parameters: { category: '图片，默认为 RPJQWQYZ，即日平均气温距平，可在对应列表项 data-id 属性中找到' },
    description: `:::tip
  若订阅日平均气温距平，将其 data-id \`RPJQWQYZ\` 作为参数填入，此时路由为 [\`/ncc-cma/cmdp/image/RPJQWQYZ\`](https://rsshub.app/ncc-cma/cmdp/image/RPJQWQYZ)。

  若同时订阅日平均气温距平、近5天平均气温距和近10天平均气温距平，将其 data-id \`RPJQWQYZ\`、\`ZJ5TPJQWJP\` 和 \`ZJ10TQWJP\` 作为参数填入，此时路由为 [\`/ncc-cma/cmdp/image/RPJQWQYZ/ZJ5TPJQWJP/ZJ10TQWJP\`](https://rsshub.app/ncc-cma/cmdp/image/RPJQWQYZ/ZJ5TPJQWJP/ZJ10TQWJP)。
  :::

  | 日平均气温距平                                              | 近5天平均气温距平                                               | 近10天平均气温距平                                            | 近20天平均气温距平                                            | 近30天平均气温距平                                            |
  | ----------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
  | [RPJQWQYZ](https://rsshub.app/ncc-cma/cmdp/image/RPJQWQYZ) | [ZJ5TPJQWJP](https://rsshub.app/ncc-cma/cmdp/image/ZJ5TPJQWJP) | [ZJ10TQWJP](https://rsshub.app/ncc-cma/cmdp/image/ZJ10TQWJP) | [ZJ20TQWJP](https://rsshub.app/ncc-cma/cmdp/image/ZJ20TQWJP) | [ZJ30TQWJP](https://rsshub.app/ncc-cma/cmdp/image/ZJ30TQWJP) |

  | 本月以来气温距平                                            | 本季以来气温距平                                            | 本年以来气温距平                                            |
  | ----------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
  | [BYYLQWJP](https://rsshub.app/ncc-cma/cmdp/image/BYYLQWJP) | [BJYLQWJP](https://rsshub.app/ncc-cma/cmdp/image/BJYLQWJP) | [BNYLQWJP](https://rsshub.app/ncc-cma/cmdp/image/BNYLQWJP) |

  | 日降水量分布                                                            | 近5天降水量                                                     | 近10天降水量                                                | 近20天降水量                                                | 近30天降水量                                                |
  | ----------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
  | [QGRJSLFBT0808S](https://rsshub.app/ncc-cma/cmdp/image/QGRJSLFBT0808S) | [ZJ5TJSLFBT](https://rsshub.app/ncc-cma/cmdp/image/ZJ5TJSLFBT) | [ZJ10TJSL](https://rsshub.app/ncc-cma/cmdp/image/ZJ10TJSL) | [ZJ20TJSL](https://rsshub.app/ncc-cma/cmdp/image/ZJ20TJSL) | [ZJ30TJSL](https://rsshub.app/ncc-cma/cmdp/image/ZJ30TJSL) |

  | 本月以来降水量                                            | 本季以来降水量                                            | 近10天降水量距平百分率                                          | 近20天降水量距平百分率                                          | 近30天降水量距平百分率                                          |
  | --------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
  | [BYYLJSL](https://rsshub.app/ncc-cma/cmdp/image/BYYLJSL) | [BJYLJSL](https://rsshub.app/ncc-cma/cmdp/image/BJYLJSL) | [ZJ10TJSLJP](https://rsshub.app/ncc-cma/cmdp/image/ZJ10TJSLJP) | [ZJ20TJSLJP](https://rsshub.app/ncc-cma/cmdp/image/ZJ20TJSLJP) | [ZJ30TJSLJP](https://rsshub.app/ncc-cma/cmdp/image/ZJ30TJSLJP) |

  | 本月以来降水量距平百分率                                                | 本季以来降水量距平百分率                                                | 本年以来降水量距平百分率                                      |
  | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
  | [BYYLJSLJPZYQHZ](https://rsshub.app/ncc-cma/cmdp/image/BYYLJSLJPZYQHZ) | [BJYLJSLJPZJQHZ](https://rsshub.app/ncc-cma/cmdp/image/BJYLJSLJPZJQHZ) | [BNYLJSLJP](https://rsshub.app/ncc-cma/cmdp/image/BNYLJSLJP) |

  | 气温距平（最近10天）                                                 | 气温距平（最近20天）                                                 | 气温距平（最近30天）                                                 | 气温距平（最近90天）                                                 | 最低气温距平（最近30天）                                           |
  | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
  | [glbtmeana10\_](https://rsshub.app/ncc-cma/cmdp/image/glbtmeana10_) | [glbtmeana20\_](https://rsshub.app/ncc-cma/cmdp/image/glbtmeana20_) | [glbtmeana30\_](https://rsshub.app/ncc-cma/cmdp/image/glbtmeana30_) | [glbtmeana90\_](https://rsshub.app/ncc-cma/cmdp/image/glbtmeana90_) | [glbtmina30\_](https://rsshub.app/ncc-cma/cmdp/image/glbtmina30_) |

  | 最低气温距平（最近90天）                                           | 最高气温距平（最近30天）                                           | 最高气温距平（最近90天）                                           |
  | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
  | [glbtmina90\_](https://rsshub.app/ncc-cma/cmdp/image/glbtmina90_) | [glbtmaxa30\_](https://rsshub.app/ncc-cma/cmdp/image/glbtmaxa30_) | [glbtmaxa90\_](https://rsshub.app/ncc-cma/cmdp/image/glbtmaxa90_) |

  | 降水量（最近10天）                                               | 降水量（最近20天）                                               | 降水量（最近30天）                                               | 降水量（最近90天）                                               | 降水距平百分率（最近10天）                                         |
  | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
  | [glbrain10\_](https://rsshub.app/ncc-cma/cmdp/image/glbrain10_) | [glbrain20\_](https://rsshub.app/ncc-cma/cmdp/image/glbrain20_) | [glbrain30\_](https://rsshub.app/ncc-cma/cmdp/image/glbrain30_) | [glbrain90\_](https://rsshub.app/ncc-cma/cmdp/image/glbrain90_) | [glbraina10\_](https://rsshub.app/ncc-cma/cmdp/image/glbraina10_) |

  | 降水距平百分率（最近20天）                                         | 降水距平百分率（最近30天）                                         | 降水距平百分率（最近90天）                                         |
  | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
  | [glbraina20\_](https://rsshub.app/ncc-cma/cmdp/image/glbraina20_) | [glbraina30\_](https://rsshub.app/ncc-cma/cmdp/image/glbraina30_) | [glbraina90\_](https://rsshub.app/ncc-cma/cmdp/image/glbraina90_) |

    `,
    categories: ['forecast'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            title: '日平均气温距平',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/RPJQWQYZ',
        },
        {
            title: '近5天平均气温距平',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/ZJ5TPJQWJP',
        },
        {
            title: '近10天平均气温距平',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/ZJ10TQWJP',
        },
        {
            title: '近20天平均气温距平',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/ZJ20TQWJP',
        },
        {
            title: '近30天平均气温距平',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/ZJ30TQWJP',
        },
        {
            title: '本月以来气温距平',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/BYYLQWJP',
        },
        {
            title: '本季以来气温距平',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/BJYLQWJP',
        },
        {
            title: '本年以来气温距平',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/BNYLQWJP',
        },
        {
            title: '日降水量分布',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/QGRJSLFBT0808S',
        },
        {
            title: '近5天降水量',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/ZJ5TJSLFBT',
        },
        {
            title: '近10天降水量',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/ZJ10TJSL',
        },
        {
            title: '近20天降水量',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/ZJ20TJSL',
        },
        {
            title: '近30天降水量',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/ZJ30TJSL',
        },
        {
            title: '本月以来降水量',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/ncc-cma/cmdp/image/BYYLJSL',
        },
        {
            title: '本季以来降水量',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/BJYLJSL',
        },
        {
            title: '近10天降水量距平百分率',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/ZJ10TJSLJP',
        },
        {
            title: '近20天降水量距平百分率',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/ZJ20TJSLJP',
        },
        {
            title: '近30天降水量距平百分率',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/ZJ30TJSLJP',
        },
        {
            title: '本月以来降水量距平百分率',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/BYYLJSLJPZYQHZ',
        },
        {
            title: '本季以来降水量距平百分率',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/BJYLJSLJPZJQHZ',
        },
        {
            title: '本年以来降水量距平百分率',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/BNYLJSLJP',
        },
        {
            title: '气温距平（最近10天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbtmeana10_',
        },
        {
            title: '气温距平（最近20天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbtmeana20_',
        },
        {
            title: '气温距平（最近30天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbtmeana30_',
        },
        {
            title: '气温距平（最近90天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbtmeana90_',
        },
        {
            title: '最低气温距平（最近30天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbtmina30_',
        },
        {
            title: '最低气温距平（最近90天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbtmina90_',
        },
        {
            title: '最高气温距平（最近30天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbtmaxa30_',
        },
        {
            title: '最高气温距平（最近90天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbtmaxa90_',
        },
        {
            title: '降水量（最近10天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbrain10_',
        },
        {
            title: '降水量（最近20天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbrain20_',
        },
        {
            title: '降水量（最近30天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbrain30_',
        },
        {
            title: '降水量（最近90天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbrain90_',
        },
        {
            title: '降水距平百分率（最近10天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbraina10_',
        },
        {
            title: '降水距平百分率（最近20天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbraina20_',
        },
        {
            title: '降水距平百分率（最近30天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbraina30_',
        },
        {
            title: '降水距平百分率（最近90天）',
            source: ['cmdp.ncc-cma.net/cn/index.htm'],
            target: '/cmdp/image/glbraina90_',
        },
    ],
};
