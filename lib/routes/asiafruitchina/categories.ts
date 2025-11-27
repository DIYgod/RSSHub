import path from 'node:path';

import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'all' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const baseUrl: string = 'https://asiafruitchina.net';
    const targetUrl: string = new URL(`categories?gspx=${category}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = $('div.listBlocks ul li')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('div.storyDetails h3 a');

            const title: string = $aEl.text();
            const description: string = art(path.join(__dirname, 'templates/description.art'), {
                images:
                    $el.find('a.image img').length > 0
                        ? $el
                              .find('a.image img')
                              .toArray()
                              .map((imgEl) => {
                                  const $imgEl: Cheerio<Element> = $(imgEl);

                                  return {
                                      src: $imgEl.attr('src'),
                                      alt: $imgEl.attr('alt'),
                                  };
                              })
                        : undefined,
            });
            const pubDateStr: string | undefined = $el.find('span.date').text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const image: string | undefined = $el.find('a.image img').attr('src');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                language,
            };

            return processedItem;
        });

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('div.story_title h1').text();
                    const description: string = art(path.join(__dirname, 'templates/description.art'), {
                        description: $$('div.storytext').html(),
                    });
                    const pubDateStr: string | undefined = $$('span.date').first().text().split(/：/).pop();
                    const categories: string[] =
                        $$('meta[name="keywords"]')
                            .attr('content')
                            ?.split(/,/)
                            .map((c) => c.trim()) ?? [];
                    const authors: DataItem['author'] = $$('span.author').first().text();
                    const upDatedStr: string | undefined = pubDateStr;

                    let processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                        category: categories,
                        author: authors,
                        content: {
                            html: description,
                            text: description,
                        },
                        updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                        language,
                    };

                    const extraLinkEls: Element[] = $$('div.extrasStory ul li').toArray();
                    const extraLinks = extraLinkEls
                        .map((extraLinkEl) => {
                            const $$extraLinkEl: Cheerio<Element> = $$(extraLinkEl);

                            return {
                                url: $$extraLinkEl.find('a').attr('href'),
                                type: 'related',
                                content_html: $$extraLinkEl.html(),
                            };
                        })
                        .filter((_): _ is { url: string; type: string; content_html: string } => true);

                    if (extraLinks) {
                        processedItem = {
                            ...processedItem,
                            _extra: {
                                links: extraLinks,
                            },
                        };
                    }

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    const title: string = $('title').text().trim();

    return {
        title,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.logo').attr('src'),
        author: title.split(/-/).pop(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/categories/:category?',
    name: '果蔬品项',
    url: 'asiafruitchina.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/asiafruitchina/categories/all',
    parameters: {
        category: {
            description: '分类，默认为 `all`，即全部，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '全部',
                    value: 'all',
                },
                {
                    label: '橙',
                    value: 'chengzi',
                },
                {
                    label: '百香果',
                    value: 'baixiangguo',
                },
                {
                    label: '菠萝/凤梨',
                    value: 'boluo',
                },
                {
                    label: '菠萝蜜',
                    value: 'boluomi',
                },
                {
                    label: '草莓',
                    value: 'caomei',
                },
                {
                    label: '番荔枝/释迦',
                    value: 'fanlizhi',
                },
                {
                    label: '番茄',
                    value: 'fanqie',
                },
                {
                    label: '柑橘',
                    value: 'ganju',
                },
                {
                    label: '哈密瓜',
                    value: 'hamigua',
                },
                {
                    label: '核果',
                    value: 'heguo',
                },
                {
                    label: '红毛丹',
                    value: 'hongmaodan',
                },
                {
                    label: '火龙果',
                    value: 'huolongguo',
                },
                {
                    label: '浆果',
                    value: 'jiangguo',
                },
                {
                    label: '桔子',
                    value: 'juzi',
                },
                {
                    label: '蓝莓',
                    value: 'lanmei',
                },
                {
                    label: '梨',
                    value: 'li',
                },
                {
                    label: '荔枝',
                    value: 'lizhi',
                },
                {
                    label: '李子',
                    value: 'lizi',
                },
                {
                    label: '榴莲',
                    value: 'liulian',
                },
                {
                    label: '龙眼',
                    value: 'lognyan',
                },
                {
                    label: '芦笋',
                    value: 'lusun',
                },
                {
                    label: '蔓越莓',
                    value: 'manyuemei',
                },
                {
                    label: '芒果',
                    value: 'mangguo',
                },
                {
                    label: '猕猴桃/奇异果',
                    value: 'mihoutao',
                },
                {
                    label: '柠檬',
                    value: 'ningmeng',
                },
                {
                    label: '牛油果',
                    value: 'niuyouguo',
                },
                {
                    label: '苹果',
                    value: 'pingguo',
                },
                {
                    label: '葡萄/提子',
                    value: 'putao',
                },
                {
                    label: '其他',
                    value: 'qita',
                },
                {
                    label: '奇异莓',
                    value: 'qiyimei',
                },
                {
                    label: '热带水果',
                    value: 'redaishuiguo',
                },
                {
                    label: '山竹',
                    value: 'shanzhu',
                },
                {
                    label: '石榴',
                    value: 'shiliu',
                },
                {
                    label: '蔬菜',
                    value: 'shucai',
                },
                {
                    label: '树莓',
                    value: 'shumei',
                },
                {
                    label: '桃',
                    value: 'tao',
                },
                {
                    label: '甜瓜',
                    value: 'tiangua',
                },
                {
                    label: '甜椒',
                    value: 'tianjiao',
                },
                {
                    label: '甜柿',
                    value: 'tianshi',
                },
                {
                    label: '香蕉',
                    value: 'xiangjiao',
                },
                {
                    label: '西瓜',
                    value: 'xigua',
                },
                {
                    label: '西梅',
                    value: 'ximei',
                },
                {
                    label: '杏',
                    value: 'xing',
                },
                {
                    label: '椰子',
                    value: 'yezi',
                },
                {
                    label: '杨梅',
                    value: 'yangmei',
                },
                {
                    label: '樱桃',
                    value: 'yintao',
                },
                {
                    label: '油桃',
                    value: 'youtao',
                },
                {
                    label: '柚子',
                    value: 'youzi',
                },
            ],
        },
    },
    description: `::: tip
若订阅 [橙](https://asiafruitchina.net/categories?gspx=chengzi)，网址为 \`https://asiafruitchina.net/categories?gspx=chengzi\`，请截取 \`https://asiafruitchina.net/categories?gspx=\` 到末尾的部分 \`chengzi\` 作为 \`category\` 参数填入，此时目标路由为 [\`/asiafruitchina/categories/chengzi\`](https://rsshub.app/asiafruitchina/categories/chengzi)。
:::

<details>
  <summary>更多分类</summary>

  | [全部](https://asiafruitchina.net/categories?gspx=all)  | [橙](https://asiafruitchina.net/categories?gspx=chengzi)        | [百香果](https://asiafruitchina.net/categories?gspx=baixiangguo)        | [菠萝/凤梨](https://asiafruitchina.net/categories?gspx=boluo) | [菠萝蜜](https://asiafruitchina.net/categories?gspx=boluomi)    |
  | ------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------- |
  | [all](https://rsshub.app/asiafruitchina/categories/all) | [chengzi](https://rsshub.app/asiafruitchina/categories/chengzi) | [baixiangguo](https://rsshub.app/asiafruitchina/categories/baixiangguo) | [boluo](https://rsshub.app/asiafruitchina/categories/boluo)   | [boluomi](https://rsshub.app/asiafruitchina/categories/boluomi) |

  | [草莓](https://asiafruitchina.net/categories?gspx=caomei)     | [番荔枝/释迦](https://asiafruitchina.net/categories?gspx=fanlizhi) | [番茄](https://asiafruitchina.net/categories?gspx=fanqie)     | [柑橘](https://asiafruitchina.net/categories?gspx=ganju)    | [哈密瓜](https://asiafruitchina.net/categories?gspx=hamigua)    |
  | ------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
  | [caomei](https://rsshub.app/asiafruitchina/categories/caomei) | [fanlizhi](https://rsshub.app/asiafruitchina/categories/fanlizhi)  | [fanqie](https://rsshub.app/asiafruitchina/categories/fanqie) | [ganju](https://rsshub.app/asiafruitchina/categories/ganju) | [hamigua](https://rsshub.app/asiafruitchina/categories/hamigua) |

  | [核果](https://asiafruitchina.net/categories?gspx=heguo)    | [红毛丹](https://asiafruitchina.net/categories?gspx=hongmaodan)       | [火龙果](https://asiafruitchina.net/categories?gspx=huolongguo)       | [浆果](https://asiafruitchina.net/categories?gspx=jiangguo)       | [桔子](https://asiafruitchina.net/categories?gspx=juzi)   |
  | ----------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
  | [heguo](https://rsshub.app/asiafruitchina/categories/heguo) | [hongmaodan](https://rsshub.app/asiafruitchina/categories/hongmaodan) | [huolongguo](https://rsshub.app/asiafruitchina/categories/huolongguo) | [jiangguo](https://rsshub.app/asiafruitchina/categories/jiangguo) | [juzi](https://rsshub.app/asiafruitchina/categories/juzi) |

  | [蓝莓](https://asiafruitchina.net/categories?gspx=lanmei)     | [梨](https://asiafruitchina.net/categories?gspx=li)   | [荔枝](https://asiafruitchina.net/categories?gspx=lizhi)    | [李子](https://asiafruitchina.net/categories?gspx=lizi)   | [榴莲](https://asiafruitchina.net/categories?gspx=liulian)      |
  | ------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
  | [lanmei](https://rsshub.app/asiafruitchina/categories/lanmei) | [li](https://rsshub.app/asiafruitchina/categories/li) | [lizhi](https://rsshub.app/asiafruitchina/categories/lizhi) | [lizi](https://rsshub.app/asiafruitchina/categories/lizi) | [liulian](https://rsshub.app/asiafruitchina/categories/liulian) |

  | [龙眼](https://asiafruitchina.net/categories?gspx=lognyan)      | [芦笋](https://asiafruitchina.net/categories?gspx=lusun)    | [蔓越莓](https://asiafruitchina.net/categories?gspx=manyuemei)      | [芒果](https://asiafruitchina.net/categories?gspx=mangguo)      | [猕猴桃/奇异果](https://asiafruitchina.net/categories?gspx=mihoutao) |
  | --------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
  | [lognyan](https://rsshub.app/asiafruitchina/categories/lognyan) | [lusun](https://rsshub.app/asiafruitchina/categories/lusun) | [manyuemei](https://rsshub.app/asiafruitchina/categories/manyuemei) | [mangguo](https://rsshub.app/asiafruitchina/categories/mangguo) | [mihoutao](https://rsshub.app/asiafruitchina/categories/mihoutao)    |

  | [柠檬](https://asiafruitchina.net/categories?gspx=ningmeng)       | [牛油果](https://asiafruitchina.net/categories?gspx=niuyouguo)      | [苹果](https://asiafruitchina.net/categories?gspx=pingguo)      | [葡萄/提子](https://asiafruitchina.net/categories?gspx=putao) | [其他](https://asiafruitchina.net/categories?gspx=qita)   |
  | ----------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
  | [ningmeng](https://rsshub.app/asiafruitchina/categories/ningmeng) | [niuyouguo](https://rsshub.app/asiafruitchina/categories/niuyouguo) | [pingguo](https://rsshub.app/asiafruitchina/categories/pingguo) | [putao](https://rsshub.app/asiafruitchina/categories/putao)   | [qita](https://rsshub.app/asiafruitchina/categories/qita) |

  | [奇异莓](https://asiafruitchina.net/categories?gspx=qiyimei)    | [热带水果](https://asiafruitchina.net/categories?gspx=redaishuiguo)       | [山竹](https://asiafruitchina.net/categories?gspx=shanzhu)      | [石榴](https://asiafruitchina.net/categories?gspx=shiliu)     | [蔬菜](https://asiafruitchina.net/categories?gspx=shucai)     |
  | --------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
  | [qiyimei](https://rsshub.app/asiafruitchina/categories/qiyimei) | [redaishuiguo](https://rsshub.app/asiafruitchina/categories/redaishuiguo) | [shanzhu](https://rsshub.app/asiafruitchina/categories/shanzhu) | [shiliu](https://rsshub.app/asiafruitchina/categories/shiliu) | [shucai](https://rsshub.app/asiafruitchina/categories/shucai) |

  | [树莓](https://asiafruitchina.net/categories?gspx=shumei)     | [桃](https://asiafruitchina.net/categories?gspx=tao)    | [甜瓜](https://asiafruitchina.net/categories?gspx=tiangua)      | [甜椒](https://asiafruitchina.net/categories?gspx=tianjiao)       | [甜柿](https://asiafruitchina.net/categories?gspx=tianshi)      |
  | ------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
  | [shumei](https://rsshub.app/asiafruitchina/categories/shumei) | [tao](https://rsshub.app/asiafruitchina/categories/tao) | [tiangua](https://rsshub.app/asiafruitchina/categories/tiangua) | [tianjiao](https://rsshub.app/asiafruitchina/categories/tianjiao) | [tianshi](https://rsshub.app/asiafruitchina/categories/tianshi) |

  | [香蕉](https://asiafruitchina.net/categories?gspx=xiangjiao)        | [西瓜](https://asiafruitchina.net/categories?gspx=xigua)    | [西梅](https://asiafruitchina.net/categories?gspx=ximei)    | [杏](https://asiafruitchina.net/categories?gspx=xing)     | [椰子](https://asiafruitchina.net/categories?gspx=yezi)   |
  | ------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
  | [xiangjiao](https://rsshub.app/asiafruitchina/categories/xiangjiao) | [xigua](https://rsshub.app/asiafruitchina/categories/xigua) | [ximei](https://rsshub.app/asiafruitchina/categories/ximei) | [xing](https://rsshub.app/asiafruitchina/categories/xing) | [yezi](https://rsshub.app/asiafruitchina/categories/yezi) |

  | [杨梅](https://asiafruitchina.net/categories?gspx=yangmei)      | [樱桃](https://asiafruitchina.net/categories?gspx=yintao)     | [油桃](https://asiafruitchina.net/categories?gspx=youtao)     | [柚子](https://asiafruitchina.net/categories?gspx=youzi)    |
  | --------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
  | [yangmei](https://rsshub.app/asiafruitchina/categories/yangmei) | [yintao](https://rsshub.app/asiafruitchina/categories/yintao) | [youtao](https://rsshub.app/asiafruitchina/categories/youtao) | [youzi](https://rsshub.app/asiafruitchina/categories/youzi) |

</details>
`,
    categories: ['new-media'],
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
            source: ['asiafruitchina.net/categories'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const category: string | undefined = urlObj.searchParams.get('id') ?? undefined;

                return `/asiafruitchina/categories${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '全部',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/all',
        },
        {
            title: '橙',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/chengzi',
        },
        {
            title: '百香果',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/baixiangguo',
        },
        {
            title: '菠萝/凤梨',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/boluo',
        },
        {
            title: '菠萝蜜',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/boluomi',
        },
        {
            title: '草莓',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/caomei',
        },
        {
            title: '番荔枝/释迦',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/fanlizhi',
        },
        {
            title: '番茄',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/fanqie',
        },
        {
            title: '柑橘',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/ganju',
        },
        {
            title: '哈密瓜',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/hamigua',
        },
        {
            title: '核果',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/heguo',
        },
        {
            title: '红毛丹',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/hongmaodan',
        },
        {
            title: '火龙果',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/huolongguo',
        },
        {
            title: '浆果',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/jiangguo',
        },
        {
            title: '桔子',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/juzi',
        },
        {
            title: '蓝莓',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/lanmei',
        },
        {
            title: '梨',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/li',
        },
        {
            title: '荔枝',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/lizhi',
        },
        {
            title: '李子',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/lizi',
        },
        {
            title: '榴莲',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/liulian',
        },
        {
            title: '龙眼',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/lognyan',
        },
        {
            title: '芦笋',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/lusun',
        },
        {
            title: '蔓越莓',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/manyuemei',
        },
        {
            title: '芒果',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/mangguo',
        },
        {
            title: '猕猴桃/奇异果',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/mihoutao',
        },
        {
            title: '柠檬',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/ningmeng',
        },
        {
            title: '牛油果',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/niuyouguo',
        },
        {
            title: '苹果',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/pingguo',
        },
        {
            title: '葡萄/提子',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/putao',
        },
        {
            title: '其他',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/qita',
        },
        {
            title: '奇异莓',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/qiyimei',
        },
        {
            title: '热带水果',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/redaishuiguo',
        },
        {
            title: '山竹',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/shanzhu',
        },
        {
            title: '石榴',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/shiliu',
        },
        {
            title: '蔬菜',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/shucai',
        },
        {
            title: '树莓',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/shumei',
        },
        {
            title: '桃',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/tao',
        },
        {
            title: '甜瓜',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/tiangua',
        },
        {
            title: '甜椒',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/tianjiao',
        },
        {
            title: '甜柿',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/tianshi',
        },
        {
            title: '香蕉',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/xiangjiao',
        },
        {
            title: '西瓜',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/xigua',
        },
        {
            title: '西梅',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/ximei',
        },
        {
            title: '杏',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/xing',
        },
        {
            title: '椰子',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/yezi',
        },
        {
            title: '杨梅',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/yangmei',
        },
        {
            title: '樱桃',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/yintao',
        },
        {
            title: '油桃',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/youtao',
        },
        {
            title: '柚子',
            source: ['asiafruitchina.net/categories'],
            target: '/categories/youzi',
        },
    ],
    view: ViewType.Articles,
};
