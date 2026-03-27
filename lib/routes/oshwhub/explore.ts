import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';
import MarkdownIt from 'markdown-it';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

const originOptions = [
    {
        label: '全部版本',
        value: 'all',
    },
    {
        label: '专业版',
        value: 'pro',
    },
    {
        label: '标准版',
        value: 'std',
    },
];

const flattenTree = (items: any[]): any[] => items.flatMap((item) => [item, ...flattenTree(item.children || [])]);

const findUuidsByNames = (data: any[], names: string[]): string[] => {
    const allItems = flattenTree(data);
    return names.flatMap((name) => allItems.filter((item) => item.name === name || item.uuid === name).map((item) => item.uuid)).filter(Boolean);
};

const findNamesByUuids = (data: any[], uuids: string[]): string[] => {
    const allItems = flattenTree(data);
    return uuids.flatMap((uuid) => allItems.filter((item) => item.uuid === uuid || item.name === uuid).map((item) => item.name)).filter(Boolean);
};

const md = MarkdownIt({
    html: true,
    linkify: true,
});

export const handler = async (ctx: Context): Promise<Data> => {
    const { type = 'new', origin = 'all', projectTag } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '15', 10);

    const baseUrl = 'https://oshwhub.com';
    const apiUrl: string = new URL('api/project', baseUrl).href;
    const apiTagUrl: string = new URL('api/project_tags', baseUrl).href;
    const targetUrl: string = new URL('explore', baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh';

    const tagResponse = await ofetch(apiTagUrl);
    const projectTagsData = tagResponse.result;

    const response = await ofetch(apiUrl, {
        query: {
            page: 1,
            pageSize: limit,
            type,
            origin,
            projectTag: findUuidsByNames(projectTagsData, projectTag?.split(/,/) ?? []),
            public: true,
        },
    });

    let items: DataItem[] = response.result.lists.slice(0, limit).map((item): DataItem => {
        const title: string = item.name;
        const image: string | undefined = item.thumb?.startsWith('https:') ? item.thumb : `https:${item.thumb}`;
        const description: string | undefined = renderDescription({
            images: image
                ? [
                      {
                          src: image,
                          alt: title,
                      },
                  ]
                : undefined,
            intro: item.introduction,
        });
        const pubDate: number | string = item.created_at;
        const linkUrl: string | undefined = item.path;
        const categories: string[] = [originOptions.find((opt) => opt.value === item.origin)?.label ?? undefined].filter(Boolean) as string[];
        const authors: DataItem['author'] = item.owner
            ? [
                  {
                      name: item.owner.name,
                      url: new URL(item.owner.username, baseUrl).href,
                      avatar: item.owner.avatar ? `https:${item.owner.avatar}` : undefined,
                  },
              ]
            : undefined;
        const guid: string = item.uuid ? `oshwhub-${item.uuid}` : '';
        const updated: number | string = item.updated_at ?? pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            link: linkUrl ? new URL(item.link, baseUrl).href : undefined,
            categories,
            author: authors,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            image,
            banner: image,
            updated: updated ? parseDate(updated) : undefined,
            language,
            uuid: item.uuid,
        };

        return processedItem;
    });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link || !item.guid) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const projectId = item.guid.replace(/^oshwhub-/, '');
                const detailUrl = new URL(`api/project/${projectId}`, baseUrl).href;
                const detailResponse = await ofetch(detailUrl);

                const result = detailResponse.result;
                const title: string = result.name;
                const pubDateStr: string | undefined = result.oshwhub_publish_at;
                const linkUrl: string | undefined = result.path;

                const origin: string | undefined = originOptions.find((opt) => opt.value === result.origin)?.label ?? undefined;
                const tags: string[] = findNamesByUuids(projectTagsData, result.project_tags ?? []);

                const categories: string[] = [...new Set([...(item.category ?? []), origin ?? undefined, ...tags, result.license].filter(Boolean) as string[])];
                const authors: DataItem['author'] = [
                    ...new Map(
                        [result.owner, result.creator, ...result.members].map((author) => {
                            const item = {
                                name: author.nickname,
                                url: new URL(author.username, baseUrl).href,
                                avatar: author.avatar ? `https:${author.avatar}` : undefined,
                            };
                            return [`${item.name}|${item.url}`, item];
                        })
                    ).values(),
                ];
                const guid: string = result.uuid ? `oshwhub-${result.uuid}` : item.guid || '';
                const image: string | undefined = result.thumb?.startsWith('https:') ? result.thumb : `https:${result.thumb}`;
                const upDatedStr: string | undefined = result.updated_at || pubDateStr;

                const attachments = result.attachments;

                const description: string | undefined = renderDescription({
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    title,
                    origin,
                    tags,
                    license: result.license,
                    intro: result.introduction,
                    pubDate: pubDateStr,
                    upDated: upDatedStr,
                    description: result.content ? md.render(result.content) : undefined,
                    documents: result.version_documents,
                    boms: result.boms ? JSON.parse(result.boms) : undefined,
                    attachments,
                });

                let processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                    link: linkUrl ? new URL(linkUrl, baseUrl).href : item.link,
                    category: categories,
                    author: authors,
                    guid,
                    id: guid,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
                    updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                    language,
                };

                const attachment = attachments?.[0];

                if (attachment && attachment.src) {
                    const enclosureUrl: string | undefined = `https://image.lceda.cn${attachment.src}`;
                    const enclosureType: string = attachment.mime;
                    const enclosureTitle: string = attachment.name;
                    const enclosureLength = Number(attachment.size);

                    processedItem = {
                        ...processedItem,
                        enclosure_url: enclosureUrl,
                        enclosure_type: enclosureType,
                        enclosure_title: enclosureTitle || title,
                        enclosure_length: enclosureLength,
                    };
                }

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    const title: string = $('title').text();

    return {
        title,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: title.split(/-/).pop()?.trim(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/explore/:type?/:origin?/:projectTag{.+}?',
    name: '开源广场',
    url: 'oshwhub.com',
    maintainers: ['tylinux', 'nczitzk'],
    handler,
    example: '/oshwhub/explore',
    parameters: {
        type: {
            description: '排序方式，默认为 `new`，即最新发布',
            options: [
                {
                    label: '综合排序',
                    value: 'default',
                },
                {
                    label: '最多点赞',
                    value: 'like',
                },
                {
                    label: '最新收藏',
                    value: 'collect',
                },
                {
                    label: '最新发布',
                    value: 'new',
                },
            ],
        },
        origin: {
            description: '工程版本，默认为 `all`，即全部版本',
            options: originOptions,
        },
        projectTag: {
            description: '项目标签，默认为空，即全部',
            options: [
                {
                    label: '嵌入式 - 51单片机',
                    value: '3b0f18b7516447f4b98a3830b1f3b665',
                },
                {
                    label: '嵌入式 - STM单片机',
                    value: 'ccf89e646cd446a3b83b2f52b0199b62',
                },
                {
                    label: '嵌入式 - AVR单片机',
                    value: '3f6426c635ff442291209a3384a84102',
                },
                {
                    label: '嵌入式 - MM单片机',
                    value: 'cc3d1169f18c416c8757901ea6df6223',
                },
                {
                    label: '嵌入式 - HK单片机',
                    value: 'b97db05d4ca84ec586b573ac8a30f903',
                },
                {
                    label: '嵌入式 - GD单片机',
                    value: 'b20331637f5145acacdcba7b4b425f86',
                },
                {
                    label: '嵌入式 - Arduino',
                    value: '656035358f114d88a6d7ae9f2f008004',
                },
                {
                    label: '嵌入式 - Linux',
                    value: 'a970fe2004094a908bccfcd3a19d8119',
                },
                {
                    label: '嵌入式 - RA单片机',
                    value: '10f420434b2e499a9d55a053a1b68532',
                },
                {
                    label: '嵌入式 - FPGA',
                    value: 'b9dc4e4d3185457fb0b036697c60c304',
                },
                {
                    label: '嵌入式 - 创客教育套件',
                    value: '7a7e2ffe306f45d49aceeccf643164f1',
                },
                {
                    label: '嵌入式 - DSP',
                    value: '7afd043f0472485f8a0bdd03b7f2b430',
                },
                {
                    label: '嵌入式 - ESP8266/32',
                    value: '6f6eefa0fcb54ab4b75469c64646d9e9',
                },
                {
                    label: '嵌入式 - Hi3861',
                    value: '08da4fffef66412c98862b56bc6de8e0',
                },
                {
                    label: '嵌入式 - CH单片机',
                    value: '46713082ee6e4e5d83ab50b2dde261f9',
                },
                {
                    label: '嵌入式 - CW32单片机',
                    value: '68b1cd8ff95c4a77ada1feac74a15cd7',
                },
                {
                    label: '嵌入式 - N32单片机',
                    value: 'a8174b755bb840c284354adda36bea97',
                },
                {
                    label: '嵌入式 - 全志系列',
                    value: '02c3807273ea47c4aaa6708b897a1608',
                },
                {
                    label: '嵌入式 - AIR32',
                    value: '91c29b363a024e73afe4fb2adc3d6336',
                },
                {
                    label: '嵌入式 - 树莓派',
                    value: '68fb2b4eacf244b6b99e208bd0c0453c',
                },
                {
                    label: '嵌入式 - RISC-V',
                    value: '5bf7f884bccf4507acc36a729d8b5078',
                },
                {
                    label: '嵌入式 - 玄铁',
                    value: 'e0a360d42a954a29bb6a3e5eee0395fd',
                },
                {
                    label: '嵌入式 - Canaan(嘉楠)',
                    value: '3dec6606d3ca4b898eb86a78fd4c40ea',
                },
                {
                    label: 'DIY设计/硬件设计 - 立创泰山派',
                    value: '26b12f4862cc4aa8a7a6ff653d9de9ed',
                },
                {
                    label: 'DIY设计/硬件设计 - 立创梁山派',
                    value: '51f92f98f8c3465ebc12e014b654a15c',
                },
                {
                    label: 'DIY设计/硬件设计 - 仿真器/编程器',
                    value: '1b87c2546ea3444e9817a1faf8f76ff2',
                },
                {
                    label: 'DIY设计/硬件设计 - 电赛TI开发板',
                    value: 'd4b25b821c8d4f7cb1bd871853400521',
                },
                {
                    label: 'DIY设计/硬件设计 - 电源/能源',
                    value: 'e804983891e743439072af4e05aba50d',
                },
                {
                    label: 'DIY设计/硬件设计 - 信号/通信',
                    value: 'b13a722e49ae40f4ae15c7448c0e807b',
                },
                {
                    label: 'DIY设计/硬件设计 - 测量/仪器',
                    value: 'b1fb4acdb7354d81b3ed3c18050d0580',
                },
                {
                    label: 'DIY设计/硬件设计 - 课设/毕设',
                    value: '7711ced2a349485d85a6cae11c91cc5d',
                },
                {
                    label: 'DIY设计/硬件设计 - DIY设计',
                    value: 'd3cacd30fc1a4dbea35aba2f00c755e3',
                },
                {
                    label: 'DIY设计/硬件设计 - 声光设计',
                    value: 'fbca6abc8a114614a5598bf7c33fb72e',
                },
                {
                    label: 'DIY设计/硬件设计 - 555定时器',
                    value: 'e53cdda17f4840158e9f9a82354f923d',
                },
                {
                    label: 'DIY设计/硬件设计 - 方案验证板',
                    value: '90637fd096424071a21927e5cdc436de',
                },
                {
                    label: 'DIY设计/硬件设计 - 面板设计',
                    value: '8e9b3ad4569943b19f701cf06d3be169',
                },
                {
                    label: '物联网/智能硬件 - 蓝牙/蓝牙mesh',
                    value: '252438513ded4c87b8bac438d006a0b8',
                },
                {
                    label: '物联网/智能硬件 - WiFi/以太网',
                    value: 'f2beb30a80134f3e9595b51148f55cf8',
                },
                {
                    label: '物联网/智能硬件 - 射频/2.4G',
                    value: '72cccbeca286458a9fb31fbbff8cd57f',
                },
                {
                    label: '物联网/智能硬件 - GSM/GPRS',
                    value: 'e2f58f5ada1b46aaa30899996e1bffee',
                },
                {
                    label: '物联网/智能硬件 - 无线定位',
                    value: '3c3111e1320c48dd8e60e46201140402',
                },
                {
                    label: '物联网/智能硬件 - 4G/5G技术',
                    value: '3e9823af89424add8e16c8d86dbe6365',
                },
                {
                    label: '物联网/智能硬件 - 智能家居',
                    value: 'f1f6fe3058c4476486baa2d51469c116',
                },
                {
                    label: '电子模块 - 电源模块',
                    value: '2613794836ff4fa2954e4cca5749584a',
                },
                {
                    label: '电子模块 - 显示模块',
                    value: '00aa2be7c4d44b5ea060419ca57a94e0',
                },
                {
                    label: '电子模块 - 通信模块',
                    value: 'a99c667254ab41f788ffbcb3e78e152b',
                },
                {
                    label: '电子模块 - 传感器模块',
                    value: 'b643637f21ea4464aeb312f29ca0131e',
                },
                {
                    label: '电子模块 - 电机驱动模块',
                    value: '7676fdaf039847e3808481a4437e004b',
                },
                {
                    label: '电子模块 - 其他模块',
                    value: '22a10af7cd434f1d8c28588b030963c5',
                },
                {
                    label: '电子应用 - 汽车电子',
                    value: 'cc45e77e32764600a9edd9c6bec9a932',
                },
                {
                    label: '电子应用 - 消费电子',
                    value: 'e5831c441f25423d88a7311a9b276871',
                },
                {
                    label: '电子应用 - 工业电子',
                    value: 'ba95313da8b24bbfbcf00182447f6063',
                },
                {
                    label: '电子应用 - 家用电子',
                    value: '7bee905a7730453c803339f2a1dc77cf',
                },
                {
                    label: '电子应用 - 医疗电子',
                    value: 'b3e25776aa9d438980f140b7577b1af7',
                },
                {
                    label: '电子应用 - 工业4.0',
                    value: '2d6d5c8697cc4061a66e6fb06e30f587',
                },
                {
                    label: '电子应用 - 开源复刻',
                    value: '935421b496b44f178a554fbdaa568e0a',
                },
                {
                    label: '电子应用 - 电子竞赛',
                    value: '08a877289c3f4f34b2ca8905996e07ed',
                },
                {
                    label: '电子应用 - AI视觉',
                    value: 'e2d486a270aa46f790318c714cc77d02',
                },
                {
                    label: '电工电子 - 电路分析',
                    value: '827cd3b7542646d682f9588973647e96',
                },
                {
                    label: '电工电子 - 电力电子',
                    value: 'a08b61928be54154bb1a346f7630e4ba',
                },
                {
                    label: '电工电子 - 模拟电路',
                    value: '858b54c552714ef586fd28705d79e1ec',
                },
                {
                    label: '电工电子 - 数字电路',
                    value: '027f0293ca4e4c0e982c3b11f13b64b6',
                },
                {
                    label: '电工电子 - 高频电路',
                    value: '8938b321c55a41b092da9443fcfba334',
                },
                {
                    label: '电工电子 - 仿真电路',
                    value: 'b29c5f43ff8c4f39930174732044842c',
                },
                {
                    label: '电子竞赛/活动 - 星火计划2025',
                    value: '9d75d82c34d74d8eb385281a6ebc7fe9',
                },
                {
                    label: '电子竞赛/活动 - 彩色丝印',
                    value: '4776bafa72df43879ea082ae1345d5bb',
                },
                {
                    label: '电子竞赛/活动 - 立创大赛',
                    value: 'f7eefe9c39ff49dabbea446863af30e3',
                },
                {
                    label: '电子竞赛/活动 - 互联网+',
                    value: '10d9b29096d347629eea7fe3a78eb290',
                },
                {
                    label: '电子竞赛/活动 - 创新杯/创青春',
                    value: 'e6920b7defbf47f78e811379ab06b3a2',
                },
                {
                    label: '电子竞赛/活动 - FPGA大赛',
                    value: '3348af772eb54f769e345c1c6312c3a9',
                },
                {
                    label: '电子竞赛/活动 - 其他比赛',
                    value: '06ed1c7532594f59916f7ce037a6f3ff',
                },
                {
                    label: '电子竞赛/活动 - 星火计划2024',
                    value: '5f4e56750b0445a7a024b01cc8fa7122',
                },
                {
                    label: '电子竞赛/活动 - 星火计划2023',
                    value: '15637284a6f545128f80a11443cdf1a0',
                },
                {
                    label: '电子设计大赛 - 校内选拔赛',
                    value: 'b9b469bc5f9f43fbbca7ea1b42ad261f',
                },
                {
                    label: '电子设计大赛 - 省赛/区赛',
                    value: '9ba4444f3c4e4c0ca6de5c5473cde4a8',
                },
                {
                    label: '电子设计大赛 - 2013年电赛',
                    value: '9b0656c41291403db63ecdd67d8caf07',
                },
                {
                    label: '电子设计大赛 - 2015年电赛',
                    value: 'fe146745542a4dde99883058b5325863',
                },
                {
                    label: '电子设计大赛 - 2019年电赛',
                    value: 'b3894c65a5ca47f19bab8867da884f04',
                },
                {
                    label: '电子设计大赛 - 2021年电赛',
                    value: '6ccb9fbbd3294c6ba93570c8d35e5310',
                },
                {
                    label: '电子设计大赛 - 2023年电赛',
                    value: 'b1e24499fcdb47c7896baf96b0e40aaa',
                },
            ],
        },
    },
    description: `:::tip
订阅 [开源广场](https://oshwhub.com/) 中最新发布的项目标签含 “51单片机”和“智能家居”的标准版项目，此时路由为 [\`/oshwhub/explore/new/std/51单片机,智能家居\`](https://rsshub.app/oshwhub/explore/new/std/51单片机,智能家居)。
:::

<details>
  <summary>更多标签</summary>

  #### [嵌入式](https://oshwhub.com/explore?tag=049aa3a2401d45af82141d8cda443355)

  | 名称                                                                             | ID                                                                                                              |
  | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
  | [51单片机](https://oshwhub.com/explore?tag=3b0f18b7516447f4b98a3830b1f3b665)     | [3b0f18b7516447f4b98a3830b1f3b665](https://rsshub.app/oshwhub/explore/new/all/3b0f18b7516447f4b98a3830b1f3b665) |
  | [STM单片机](https://oshwhub.com/explore?tag=ccf89e646cd446a3b83b2f52b0199b62)    | [ccf89e646cd446a3b83b2f52b0199b62](https://rsshub.app/oshwhub/explore/new/all/ccf89e646cd446a3b83b2f52b0199b62) |
  | [AVR单片机](https://oshwhub.com/explore?tag=3f6426c635ff442291209a3384a84102)    | [3f6426c635ff442291209a3384a84102](https://rsshub.app/oshwhub/explore/new/all/3f6426c635ff442291209a3384a84102) |
  | [MM单片机](https://oshwhub.com/explore?tag=cc3d1169f18c416c8757901ea6df6223)     | [cc3d1169f18c416c8757901ea6df6223](https://rsshub.app/oshwhub/explore/new/all/cc3d1169f18c416c8757901ea6df6223) |
  | [HK单片机](https://oshwhub.com/explore?tag=b97db05d4ca84ec586b573ac8a30f903)     | [b97db05d4ca84ec586b573ac8a30f903](https://rsshub.app/oshwhub/explore/new/all/b97db05d4ca84ec586b573ac8a30f903) |
  | [GD单片机](https://oshwhub.com/explore?tag=b20331637f5145acacdcba7b4b425f86)     | [b20331637f5145acacdcba7b4b425f86](https://rsshub.app/oshwhub/explore/new/all/b20331637f5145acacdcba7b4b425f86) |
  | [Arduino](https://oshwhub.com/explore?tag=656035358f114d88a6d7ae9f2f008004)      | [656035358f114d88a6d7ae9f2f008004](https://rsshub.app/oshwhub/explore/new/all/656035358f114d88a6d7ae9f2f008004) |
  | [Linux](https://oshwhub.com/explore?tag=a970fe2004094a908bccfcd3a19d8119)        | [a970fe2004094a908bccfcd3a19d8119](https://rsshub.app/oshwhub/explore/new/all/a970fe2004094a908bccfcd3a19d8119) |
  | [RA单片机](https://oshwhub.com/explore?tag=10f420434b2e499a9d55a053a1b68532)     | [10f420434b2e499a9d55a053a1b68532](https://rsshub.app/oshwhub/explore/new/all/10f420434b2e499a9d55a053a1b68532) |
  | [FPGA](https://oshwhub.com/explore?tag=b9dc4e4d3185457fb0b036697c60c304)         | [b9dc4e4d3185457fb0b036697c60c304](https://rsshub.app/oshwhub/explore/new/all/b9dc4e4d3185457fb0b036697c60c304) |
  | [创客教育套件](https://oshwhub.com/explore?tag=7a7e2ffe306f45d49aceeccf643164f1) | [7a7e2ffe306f45d49aceeccf643164f1](https://rsshub.app/oshwhub/explore/new/all/7a7e2ffe306f45d49aceeccf643164f1) |
  | [DSP](https://oshwhub.com/explore?tag=7afd043f0472485f8a0bdd03b7f2b430)          | [7afd043f0472485f8a0bdd03b7f2b430](https://rsshub.app/oshwhub/explore/new/all/7afd043f0472485f8a0bdd03b7f2b430) |
  | [ESP8266/32](https://oshwhub.com/explore?tag=6f6eefa0fcb54ab4b75469c64646d9e9)   | [6f6eefa0fcb54ab4b75469c64646d9e9](https://rsshub.app/oshwhub/explore/new/all/6f6eefa0fcb54ab4b75469c64646d9e9) |
  | [Hi3861](https://oshwhub.com/explore?tag=08da4fffef66412c98862b56bc6de8e0)       | [08da4fffef66412c98862b56bc6de8e0](https://rsshub.app/oshwhub/explore/new/all/08da4fffef66412c98862b56bc6de8e0) |
  | [CH单片机](https://oshwhub.com/explore?tag=46713082ee6e4e5d83ab50b2dde261f9)     | [46713082ee6e4e5d83ab50b2dde261f9](https://rsshub.app/oshwhub/explore/new/all/46713082ee6e4e5d83ab50b2dde261f9) |
  | [CW32单片机](https://oshwhub.com/explore?tag=68b1cd8ff95c4a77ada1feac74a15cd7)   | [68b1cd8ff95c4a77ada1feac74a15cd7](https://rsshub.app/oshwhub/explore/new/all/68b1cd8ff95c4a77ada1feac74a15cd7) |
  | [N32单片机](https://oshwhub.com/explore?tag=a8174b755bb840c284354adda36bea97)    | [a8174b755bb840c284354adda36bea97](https://rsshub.app/oshwhub/explore/new/all/a8174b755bb840c284354adda36bea97) |
  | [全志系列](https://oshwhub.com/explore?tag=02c3807273ea47c4aaa6708b897a1608)     | [02c3807273ea47c4aaa6708b897a1608](https://rsshub.app/oshwhub/explore/new/all/02c3807273ea47c4aaa6708b897a1608) |
  | [AIR32](https://oshwhub.com/explore?tag=91c29b363a024e73afe4fb2adc3d6336)        | [91c29b363a024e73afe4fb2adc3d6336](https://rsshub.app/oshwhub/explore/new/all/91c29b363a024e73afe4fb2adc3d6336) |
  | [树莓派](https://oshwhub.com/explore?tag=68fb2b4eacf244b6b99e208bd0c0453c)       | [68fb2b4eacf244b6b99e208bd0c0453c](https://rsshub.app/oshwhub/explore/new/all/68fb2b4eacf244b6b99e208bd0c0453c) |
  | [RISC-V](https://oshwhub.com/explore?tag=5bf7f884bccf4507acc36a729d8b5078)       | [5bf7f884bccf4507acc36a729d8b5078](https://rsshub.app/oshwhub/explore/new/all/5bf7f884bccf4507acc36a729d8b5078) |
  | [玄铁](https://oshwhub.com/explore?tag=e0a360d42a954a29bb6a3e5eee0395fd)         | [e0a360d42a954a29bb6a3e5eee0395fd](https://rsshub.app/oshwhub/explore/new/all/e0a360d42a954a29bb6a3e5eee0395fd) |
  | [Canaan(嘉楠)](https://oshwhub.com/explore?tag=3dec6606d3ca4b898eb86a78fd4c40ea) | [3dec6606d3ca4b898eb86a78fd4c40ea](https://rsshub.app/oshwhub/explore/new/all/3dec6606d3ca4b898eb86a78fd4c40ea) |

  #### [DIY设计/硬件设计](https://oshwhub.com/explore?tag=b40d10b303384f2c8fc10764dea14413)

  | 名称                                                                              | ID                                                                                                              |
  | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
  | [立创泰山派](https://oshwhub.com/explore?tag=26b12f4862cc4aa8a7a6ff653d9de9ed)    | [26b12f4862cc4aa8a7a6ff653d9de9ed](https://rsshub.app/oshwhub/explore/new/all/26b12f4862cc4aa8a7a6ff653d9de9ed) |
  | [立创梁山派](https://oshwhub.com/explore?tag=51f92f98f8c3465ebc12e014b654a15c)    | [51f92f98f8c3465ebc12e014b654a15c](https://rsshub.app/oshwhub/explore/new/all/51f92f98f8c3465ebc12e014b654a15c) |
  | [仿真器/编程器](https://oshwhub.com/explore?tag=1b87c2546ea3444e9817a1faf8f76ff2) | [1b87c2546ea3444e9817a1faf8f76ff2](https://rsshub.app/oshwhub/explore/new/all/1b87c2546ea3444e9817a1faf8f76ff2) |
  | [电赛TI开发板](https://oshwhub.com/explore?tag=d4b25b821c8d4f7cb1bd871853400521)  | [d4b25b821c8d4f7cb1bd871853400521](https://rsshub.app/oshwhub/explore/new/all/d4b25b821c8d4f7cb1bd871853400521) |
  | [电源/能源](https://oshwhub.com/explore?tag=e804983891e743439072af4e05aba50d)     | [e804983891e743439072af4e05aba50d](https://rsshub.app/oshwhub/explore/new/all/e804983891e743439072af4e05aba50d) |
  | [信号/通信](https://oshwhub.com/explore?tag=b13a722e49ae40f4ae15c7448c0e807b)     | [b13a722e49ae40f4ae15c7448c0e807b](https://rsshub.app/oshwhub/explore/new/all/b13a722e49ae40f4ae15c7448c0e807b) |
  | [测量/仪器](https://oshwhub.com/explore?tag=b1fb4acdb7354d81b3ed3c18050d0580)     | [b1fb4acdb7354d81b3ed3c18050d0580](https://rsshub.app/oshwhub/explore/new/all/b1fb4acdb7354d81b3ed3c18050d0580) |
  | [课设/毕设](https://oshwhub.com/explore?tag=7711ced2a349485d85a6cae11c91cc5d)     | [7711ced2a349485d85a6cae11c91cc5d](https://rsshub.app/oshwhub/explore/new/all/7711ced2a349485d85a6cae11c91cc5d) |
  | [DIY设计](https://oshwhub.com/explore?tag=d3cacd30fc1a4dbea35aba2f00c755e3)       | [d3cacd30fc1a4dbea35aba2f00c755e3](https://rsshub.app/oshwhub/explore/new/all/d3cacd30fc1a4dbea35aba2f00c755e3) |
  | [声光设计](https://oshwhub.com/explore?tag=fbca6abc8a114614a5598bf7c33fb72e)      | [fbca6abc8a114614a5598bf7c33fb72e](https://rsshub.app/oshwhub/explore/new/all/fbca6abc8a114614a5598bf7c33fb72e) |
  | [555定时器](https://oshwhub.com/explore?tag=e53cdda17f4840158e9f9a82354f923d)     | [e53cdda17f4840158e9f9a82354f923d](https://rsshub.app/oshwhub/explore/new/all/e53cdda17f4840158e9f9a82354f923d) |
  | [方案验证板](https://oshwhub.com/explore?tag=90637fd096424071a21927e5cdc436de)    | [90637fd096424071a21927e5cdc436de](https://rsshub.app/oshwhub/explore/new/all/90637fd096424071a21927e5cdc436de) |
  | [面板设计](https://oshwhub.com/explore?tag=8e9b3ad4569943b19f701cf06d3be169)      | [8e9b3ad4569943b19f701cf06d3be169](https://rsshub.app/oshwhub/explore/new/all/8e9b3ad4569943b19f701cf06d3be169) |

  #### [物联网/智能硬件](https://oshwhub.com/explore?tag=a40182a4166848b0bfa2339022de3f32)

  | 名称                                                                              | ID                                                                                                              |
  | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
  | [蓝牙/蓝牙mesh](https://oshwhub.com/explore?tag=252438513ded4c87b8bac438d006a0b8) | [252438513ded4c87b8bac438d006a0b8](https://rsshub.app/oshwhub/explore/new/all/252438513ded4c87b8bac438d006a0b8) |
  | [WiFi/以太网](https://oshwhub.com/explore?tag=f2beb30a80134f3e9595b51148f55cf8)   | [f2beb30a80134f3e9595b51148f55cf8](https://rsshub.app/oshwhub/explore/new/all/f2beb30a80134f3e9595b51148f55cf8) |
  | [射频/2.4G](https://oshwhub.com/explore?tag=72cccbeca286458a9fb31fbbff8cd57f)     | [72cccbeca286458a9fb31fbbff8cd57f](https://rsshub.app/oshwhub/explore/new/all/72cccbeca286458a9fb31fbbff8cd57f) |
  | [GSM/GPRS](https://oshwhub.com/explore?tag=e2f58f5ada1b46aaa30899996e1bffee)      | [e2f58f5ada1b46aaa30899996e1bffee](https://rsshub.app/oshwhub/explore/new/all/e2f58f5ada1b46aaa30899996e1bffee) |
  | [无线定位](https://oshwhub.com/explore?tag=3c3111e1320c48dd8e60e46201140402)      | [3c3111e1320c48dd8e60e46201140402](https://rsshub.app/oshwhub/explore/new/all/3c3111e1320c48dd8e60e46201140402) |
  | [4G/5G技术](https://oshwhub.com/explore?tag=3e9823af89424add8e16c8d86dbe6365)     | [3e9823af89424add8e16c8d86dbe6365](https://rsshub.app/oshwhub/explore/new/all/3e9823af89424add8e16c8d86dbe6365) |
  | [智能家居](https://oshwhub.com/explore?tag=f1f6fe3058c4476486baa2d51469c116)      | [f1f6fe3058c4476486baa2d51469c116](https://rsshub.app/oshwhub/explore/new/all/f1f6fe3058c4476486baa2d51469c116) |

  #### [电子模块](https://oshwhub.com/explore?tag=8fba85199b604bb98cda470603f98299)

  | 名称                                                                             | ID                                                                                                              |
  | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
  | [电源模块](https://oshwhub.com/explore?tag=2613794836ff4fa2954e4cca5749584a)     | [2613794836ff4fa2954e4cca5749584a](https://rsshub.app/oshwhub/explore/new/all/2613794836ff4fa2954e4cca5749584a) |
  | [显示模块](https://oshwhub.com/explore?tag=00aa2be7c4d44b5ea060419ca57a94e0)     | [00aa2be7c4d44b5ea060419ca57a94e0](https://rsshub.app/oshwhub/explore/new/all/00aa2be7c4d44b5ea060419ca57a94e0) |
  | [通信模块](https://oshwhub.com/explore?tag=a99c667254ab41f788ffbcb3e78e152b)     | [a99c667254ab41f788ffbcb3e78e152b](https://rsshub.app/oshwhub/explore/new/all/a99c667254ab41f788ffbcb3e78e152b) |
  | [传感器模块](https://oshwhub.com/explore?tag=b643637f21ea4464aeb312f29ca0131e)   | [b643637f21ea4464aeb312f29ca0131e](https://rsshub.app/oshwhub/explore/new/all/b643637f21ea4464aeb312f29ca0131e) |
  | [电机驱动模块](https://oshwhub.com/explore?tag=7676fdaf039847e3808481a4437e004b) | [7676fdaf039847e3808481a4437e004b](https://rsshub.app/oshwhub/explore/new/all/7676fdaf039847e3808481a4437e004b) |
  | [其他模块](https://oshwhub.com/explore?tag=22a10af7cd434f1d8c28588b030963c5)     | [22a10af7cd434f1d8c28588b030963c5](https://rsshub.app/oshwhub/explore/new/all/22a10af7cd434f1d8c28588b030963c5) |

  #### [电子应用](https://oshwhub.com/explore?tag=9759ce685d0f4fb9b5c48c2f99d1b528)

  | 名称                                                                         | ID                                                                                                              |
  | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
  | [汽车电子](https://oshwhub.com/explore?tag=cc45e77e32764600a9edd9c6bec9a932) | [cc45e77e32764600a9edd9c6bec9a932](https://rsshub.app/oshwhub/explore/new/all/cc45e77e32764600a9edd9c6bec9a932) |
  | [消费电子](https://oshwhub.com/explore?tag=e5831c441f25423d88a7311a9b276871) | [e5831c441f25423d88a7311a9b276871](https://rsshub.app/oshwhub/explore/new/all/e5831c441f25423d88a7311a9b276871) |
  | [工业电子](https://oshwhub.com/explore?tag=ba95313da8b24bbfbcf00182447f6063) | [ba95313da8b24bbfbcf00182447f6063](https://rsshub.app/oshwhub/explore/new/all/ba95313da8b24bbfbcf00182447f6063) |
  | [家用电子](https://oshwhub.com/explore?tag=7bee905a7730453c803339f2a1dc77cf) | [7bee905a7730453c803339f2a1dc77cf](https://rsshub.app/oshwhub/explore/new/all/7bee905a7730453c803339f2a1dc77cf) |
  | [医疗电子](https://oshwhub.com/explore?tag=b3e25776aa9d438980f140b7577b1af7) | [b3e25776aa9d438980f140b7577b1af7](https://rsshub.app/oshwhub/explore/new/all/b3e25776aa9d438980f140b7577b1af7) |
  | [工业4.0](https://oshwhub.com/explore?tag=2d6d5c8697cc4061a66e6fb06e30f587)  | [2d6d5c8697cc4061a66e6fb06e30f587](https://rsshub.app/oshwhub/explore/new/all/2d6d5c8697cc4061a66e6fb06e30f587) |
  | [开源复刻](https://oshwhub.com/explore?tag=935421b496b44f178a554fbdaa568e0a) | [935421b496b44f178a554fbdaa568e0a](https://rsshub.app/oshwhub/explore/new/all/935421b496b44f178a554fbdaa568e0a) |
  | [电子竞赛](https://oshwhub.com/explore?tag=08a877289c3f4f34b2ca8905996e07ed) | [08a877289c3f4f34b2ca8905996e07ed](https://rsshub.app/oshwhub/explore/new/all/08a877289c3f4f34b2ca8905996e07ed) |
  | [AI视觉](https://oshwhub.com/explore?tag=e2d486a270aa46f790318c714cc77d02)   | [e2d486a270aa46f790318c714cc77d02](https://rsshub.app/oshwhub/explore/new/all/e2d486a270aa46f790318c714cc77d02) |

  #### [电工电子](https://oshwhub.com/explore?tag=9456044232c4473d809b794e2c1c5b3c)

  | 名称                                                                         | ID                                                                                                              |
  | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
  | [电路分析](https://oshwhub.com/explore?tag=827cd3b7542646d682f9588973647e96) | [827cd3b7542646d682f9588973647e96](https://rsshub.app/oshwhub/explore/new/all/827cd3b7542646d682f9588973647e96) |
  | [电力电子](https://oshwhub.com/explore?tag=a08b61928be54154bb1a346f7630e4ba) | [a08b61928be54154bb1a346f7630e4ba](https://rsshub.app/oshwhub/explore/new/all/a08b61928be54154bb1a346f7630e4ba) |
  | [模拟电路](https://oshwhub.com/explore?tag=858b54c552714ef586fd28705d79e1ec) | [858b54c552714ef586fd28705d79e1ec](https://rsshub.app/oshwhub/explore/new/all/858b54c552714ef586fd28705d79e1ec) |
  | [数字电路](https://oshwhub.com/explore?tag=027f0293ca4e4c0e982c3b11f13b64b6) | [027f0293ca4e4c0e982c3b11f13b64b6](https://rsshub.app/oshwhub/explore/new/all/027f0293ca4e4c0e982c3b11f13b64b6) |
  | [高频电路](https://oshwhub.com/explore?tag=8938b321c55a41b092da9443fcfba334) | [8938b321c55a41b092da9443fcfba334](https://rsshub.app/oshwhub/explore/new/all/8938b321c55a41b092da9443fcfba334) |
  | [仿真电路](https://oshwhub.com/explore?tag=b29c5f43ff8c4f39930174732044842c) | [b29c5f43ff8c4f39930174732044842c](https://rsshub.app/oshwhub/explore/new/all/b29c5f43ff8c4f39930174732044842c) |

  #### [电子竞赛/活动](https://oshwhub.com/explore?tag=be87aefef90542438ff784899e6e0270)

  | 名称                                                                              | ID                                                                                                              |
  | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
  | [星火计划2025](https://oshwhub.com/explore?tag=9d75d82c34d74d8eb385281a6ebc7fe9)  | [9d75d82c34d74d8eb385281a6ebc7fe9](https://rsshub.app/oshwhub/explore/new/all/9d75d82c34d74d8eb385281a6ebc7fe9) |
  | [彩色丝印](https://oshwhub.com/explore?tag=4776bafa72df43879ea082ae1345d5bb)      | [4776bafa72df43879ea082ae1345d5bb](https://rsshub.app/oshwhub/explore/new/all/4776bafa72df43879ea082ae1345d5bb) |
  | [立创大赛](https://oshwhub.com/explore?tag=f7eefe9c39ff49dabbea446863af30e3)      | [f7eefe9c39ff49dabbea446863af30e3](https://rsshub.app/oshwhub/explore/new/all/f7eefe9c39ff49dabbea446863af30e3) |
  | [互联网+](https://oshwhub.com/explore?tag=10d9b29096d347629eea7fe3a78eb290)       | [10d9b29096d347629eea7fe3a78eb290](https://rsshub.app/oshwhub/explore/new/all/10d9b29096d347629eea7fe3a78eb290) |
  | [创新杯/创青春](https://oshwhub.com/explore?tag=e6920b7defbf47f78e811379ab06b3a2) | [e6920b7defbf47f78e811379ab06b3a2](https://rsshub.app/oshwhub/explore/new/all/e6920b7defbf47f78e811379ab06b3a2) |
  | [FPGA大赛](https://oshwhub.com/explore?tag=3348af772eb54f769e345c1c6312c3a9)      | [3348af772eb54f769e345c1c6312c3a9](https://rsshub.app/oshwhub/explore/new/all/3348af772eb54f769e345c1c6312c3a9) |
  | [其他比赛](https://oshwhub.com/explore?tag=06ed1c7532594f59916f7ce037a6f3ff)      | [06ed1c7532594f59916f7ce037a6f3ff](https://rsshub.app/oshwhub/explore/new/all/06ed1c7532594f59916f7ce037a6f3ff) |
  | [星火计划2024](https://oshwhub.com/explore?tag=5f4e56750b0445a7a024b01cc8fa7122)  | [5f4e56750b0445a7a024b01cc8fa7122](https://rsshub.app/oshwhub/explore/new/all/5f4e56750b0445a7a024b01cc8fa7122) |
  | [星火计划2023](https://oshwhub.com/explore?tag=15637284a6f545128f80a11443cdf1a0)  | [15637284a6f545128f80a11443cdf1a0](https://rsshub.app/oshwhub/explore/new/all/15637284a6f545128f80a11443cdf1a0) |

  #### [电子设计大赛](https://oshwhub.com/explore?tag=f207d2c4ad2644b7acb4f8345bf6cee6)

  | 名称                                                                           | ID                                                                                                              |
  | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
  | [校内选拔赛](https://oshwhub.com/explore?tag=b9b469bc5f9f43fbbca7ea1b42ad261f) | [b9b469bc5f9f43fbbca7ea1b42ad261f](https://rsshub.app/oshwhub/explore/new/all/b9b469bc5f9f43fbbca7ea1b42ad261f) |
  | [省赛/区赛](https://oshwhub.com/explore?tag=9ba4444f3c4e4c0ca6de5c5473cde4a8)  | [9ba4444f3c4e4c0ca6de5c5473cde4a8](https://rsshub.app/oshwhub/explore/new/all/9ba4444f3c4e4c0ca6de5c5473cde4a8) |
  | [2013年电赛](https://oshwhub.com/explore?tag=9b0656c41291403db63ecdd67d8caf07) | [9b0656c41291403db63ecdd67d8caf07](https://rsshub.app/oshwhub/explore/new/all/9b0656c41291403db63ecdd67d8caf07) |
  | [2015年电赛](https://oshwhub.com/explore?tag=fe146745542a4dde99883058b5325863) | [fe146745542a4dde99883058b5325863](https://rsshub.app/oshwhub/explore/new/all/fe146745542a4dde99883058b5325863) |
  | [2019年电赛](https://oshwhub.com/explore?tag=b3894c65a5ca47f19bab8867da884f04) | [b3894c65a5ca47f19bab8867da884f04](https://rsshub.app/oshwhub/explore/new/all/b3894c65a5ca47f19bab8867da884f04) |
  | [2021年电赛](https://oshwhub.com/explore?tag=6ccb9fbbd3294c6ba93570c8d35e5310) | [6ccb9fbbd3294c6ba93570c8d35e5310](https://rsshub.app/oshwhub/explore/new/all/6ccb9fbbd3294c6ba93570c8d35e5310) |
  | [2023年电赛](https://oshwhub.com/explore?tag=b1e24499fcdb47c7896baf96b0e40aaa) | [b1e24499fcdb47c7896baf96b0e40aaa](https://rsshub.app/oshwhub/explore/new/all/b1e24499fcdb47c7896baf96b0e40aaa) |

</details>
`,
    categories: ['programming'],
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
            source: ['oshwhub.com/explore'],
            target: '/explore',
        },
        {
            title: '嵌入式 - 51单片机',
            source: ['oshwhub.com/explore?tag=3b0f18b7516447f4b98a3830b1f3b665'],
            target: '/explore/new/all/3b0f18b7516447f4b98a3830b1f3b665',
        },
        {
            title: '嵌入式 - STM单片机',
            source: ['oshwhub.com/explore?tag=ccf89e646cd446a3b83b2f52b0199b62'],
            target: '/explore/new/all/ccf89e646cd446a3b83b2f52b0199b62',
        },
        {
            title: '嵌入式 - AVR单片机',
            source: ['oshwhub.com/explore?tag=3f6426c635ff442291209a3384a84102'],
            target: '/explore/new/all/3f6426c635ff442291209a3384a84102',
        },
        {
            title: '嵌入式 - MM单片机',
            source: ['oshwhub.com/explore?tag=cc3d1169f18c416c8757901ea6df6223'],
            target: '/explore/new/all/cc3d1169f18c416c8757901ea6df6223',
        },
        {
            title: '嵌入式 - HK单片机',
            source: ['oshwhub.com/explore?tag=b97db05d4ca84ec586b573ac8a30f903'],
            target: '/explore/new/all/b97db05d4ca84ec586b573ac8a30f903',
        },
        {
            title: '嵌入式 - GD单片机',
            source: ['oshwhub.com/explore?tag=b20331637f5145acacdcba7b4b425f86'],
            target: '/explore/new/all/b20331637f5145acacdcba7b4b425f86',
        },
        {
            title: '嵌入式 - Arduino',
            source: ['oshwhub.com/explore?tag=656035358f114d88a6d7ae9f2f008004'],
            target: '/explore/new/all/656035358f114d88a6d7ae9f2f008004',
        },
        {
            title: '嵌入式 - Linux',
            source: ['oshwhub.com/explore?tag=a970fe2004094a908bccfcd3a19d8119'],
            target: '/explore/new/all/a970fe2004094a908bccfcd3a19d8119',
        },
        {
            title: '嵌入式 - RA单片机',
            source: ['oshwhub.com/explore?tag=10f420434b2e499a9d55a053a1b68532'],
            target: '/explore/new/all/10f420434b2e499a9d55a053a1b68532',
        },
        {
            title: '嵌入式 - FPGA',
            source: ['oshwhub.com/explore?tag=b9dc4e4d3185457fb0b036697c60c304'],
            target: '/explore/new/all/b9dc4e4d3185457fb0b036697c60c304',
        },
        {
            title: '嵌入式 - 创客教育套件',
            source: ['oshwhub.com/explore?tag=7a7e2ffe306f45d49aceeccf643164f1'],
            target: '/explore/new/all/7a7e2ffe306f45d49aceeccf643164f1',
        },
        {
            title: '嵌入式 - DSP',
            source: ['oshwhub.com/explore?tag=7afd043f0472485f8a0bdd03b7f2b430'],
            target: '/explore/new/all/7afd043f0472485f8a0bdd03b7f2b430',
        },
        {
            title: '嵌入式 - ESP8266/32',
            source: ['oshwhub.com/explore?tag=6f6eefa0fcb54ab4b75469c64646d9e9'],
            target: '/explore/new/all/6f6eefa0fcb54ab4b75469c64646d9e9',
        },
        {
            title: '嵌入式 - Hi3861',
            source: ['oshwhub.com/explore?tag=08da4fffef66412c98862b56bc6de8e0'],
            target: '/explore/new/all/08da4fffef66412c98862b56bc6de8e0',
        },
        {
            title: '嵌入式 - CH单片机',
            source: ['oshwhub.com/explore?tag=46713082ee6e4e5d83ab50b2dde261f9'],
            target: '/explore/new/all/46713082ee6e4e5d83ab50b2dde261f9',
        },
        {
            title: '嵌入式 - CW32单片机',
            source: ['oshwhub.com/explore?tag=68b1cd8ff95c4a77ada1feac74a15cd7'],
            target: '/explore/new/all/68b1cd8ff95c4a77ada1feac74a15cd7',
        },
        {
            title: '嵌入式 - N32单片机',
            source: ['oshwhub.com/explore?tag=a8174b755bb840c284354adda36bea97'],
            target: '/explore/new/all/a8174b755bb840c284354adda36bea97',
        },
        {
            title: '嵌入式 - 全志系列',
            source: ['oshwhub.com/explore?tag=02c3807273ea47c4aaa6708b897a1608'],
            target: '/explore/new/all/02c3807273ea47c4aaa6708b897a1608',
        },
        {
            title: '嵌入式 - AIR32',
            source: ['oshwhub.com/explore?tag=91c29b363a024e73afe4fb2adc3d6336'],
            target: '/explore/new/all/91c29b363a024e73afe4fb2adc3d6336',
        },
        {
            title: '嵌入式 - 树莓派',
            source: ['oshwhub.com/explore?tag=68fb2b4eacf244b6b99e208bd0c0453c'],
            target: '/explore/new/all/68fb2b4eacf244b6b99e208bd0c0453c',
        },
        {
            title: '嵌入式 - RISC-V',
            source: ['oshwhub.com/explore?tag=5bf7f884bccf4507acc36a729d8b5078'],
            target: '/explore/new/all/5bf7f884bccf4507acc36a729d8b5078',
        },
        {
            title: '嵌入式 - 玄铁',
            source: ['oshwhub.com/explore?tag=e0a360d42a954a29bb6a3e5eee0395fd'],
            target: '/explore/new/all/e0a360d42a954a29bb6a3e5eee0395fd',
        },
        {
            title: '嵌入式 - Canaan(嘉楠)',
            source: ['oshwhub.com/explore?tag=3dec6606d3ca4b898eb86a78fd4c40ea'],
            target: '/explore/new/all/3dec6606d3ca4b898eb86a78fd4c40ea',
        },
        {
            title: 'DIY设计/硬件设计 - 立创泰山派',
            source: ['oshwhub.com/explore?tag=26b12f4862cc4aa8a7a6ff653d9de9ed'],
            target: '/explore/new/all/26b12f4862cc4aa8a7a6ff653d9de9ed',
        },
        {
            title: 'DIY设计/硬件设计 - 立创梁山派',
            source: ['oshwhub.com/explore?tag=51f92f98f8c3465ebc12e014b654a15c'],
            target: '/explore/new/all/51f92f98f8c3465ebc12e014b654a15c',
        },
        {
            title: 'DIY设计/硬件设计 - 仿真器/编程器',
            source: ['oshwhub.com/explore?tag=1b87c2546ea3444e9817a1faf8f76ff2'],
            target: '/explore/new/all/1b87c2546ea3444e9817a1faf8f76ff2',
        },
        {
            title: 'DIY设计/硬件设计 - 电赛TI开发板',
            source: ['oshwhub.com/explore?tag=d4b25b821c8d4f7cb1bd871853400521'],
            target: '/explore/new/all/d4b25b821c8d4f7cb1bd871853400521',
        },
        {
            title: 'DIY设计/硬件设计 - 电源/能源',
            source: ['oshwhub.com/explore?tag=e804983891e743439072af4e05aba50d'],
            target: '/explore/new/all/e804983891e743439072af4e05aba50d',
        },
        {
            title: 'DIY设计/硬件设计 - 信号/通信',
            source: ['oshwhub.com/explore?tag=b13a722e49ae40f4ae15c7448c0e807b'],
            target: '/explore/new/all/b13a722e49ae40f4ae15c7448c0e807b',
        },
        {
            title: 'DIY设计/硬件设计 - 测量/仪器',
            source: ['oshwhub.com/explore?tag=b1fb4acdb7354d81b3ed3c18050d0580'],
            target: '/explore/new/all/b1fb4acdb7354d81b3ed3c18050d0580',
        },
        {
            title: 'DIY设计/硬件设计 - 课设/毕设',
            source: ['oshwhub.com/explore?tag=7711ced2a349485d85a6cae11c91cc5d'],
            target: '/explore/new/all/7711ced2a349485d85a6cae11c91cc5d',
        },
        {
            title: 'DIY设计/硬件设计 - DIY设计',
            source: ['oshwhub.com/explore?tag=d3cacd30fc1a4dbea35aba2f00c755e3'],
            target: '/explore/new/all/d3cacd30fc1a4dbea35aba2f00c755e3',
        },
        {
            title: 'DIY设计/硬件设计 - 声光设计',
            source: ['oshwhub.com/explore?tag=fbca6abc8a114614a5598bf7c33fb72e'],
            target: '/explore/new/all/fbca6abc8a114614a5598bf7c33fb72e',
        },
        {
            title: 'DIY设计/硬件设计 - 555定时器',
            source: ['oshwhub.com/explore?tag=e53cdda17f4840158e9f9a82354f923d'],
            target: '/explore/new/all/e53cdda17f4840158e9f9a82354f923d',
        },
        {
            title: 'DIY设计/硬件设计 - 方案验证板',
            source: ['oshwhub.com/explore?tag=90637fd096424071a21927e5cdc436de'],
            target: '/explore/new/all/90637fd096424071a21927e5cdc436de',
        },
        {
            title: 'DIY设计/硬件设计 - 面板设计',
            source: ['oshwhub.com/explore?tag=8e9b3ad4569943b19f701cf06d3be169'],
            target: '/explore/new/all/8e9b3ad4569943b19f701cf06d3be169',
        },
        {
            title: '物联网/智能硬件 - 蓝牙/蓝牙mesh',
            source: ['oshwhub.com/explore?tag=252438513ded4c87b8bac438d006a0b8'],
            target: '/explore/new/all/252438513ded4c87b8bac438d006a0b8',
        },
        {
            title: '物联网/智能硬件 - WiFi/以太网',
            source: ['oshwhub.com/explore?tag=f2beb30a80134f3e9595b51148f55cf8'],
            target: '/explore/new/all/f2beb30a80134f3e9595b51148f55cf8',
        },
        {
            title: '物联网/智能硬件 - 射频/2.4G',
            source: ['oshwhub.com/explore?tag=72cccbeca286458a9fb31fbbff8cd57f'],
            target: '/explore/new/all/72cccbeca286458a9fb31fbbff8cd57f',
        },
        {
            title: '物联网/智能硬件 - GSM/GPRS',
            source: ['oshwhub.com/explore?tag=e2f58f5ada1b46aaa30899996e1bffee'],
            target: '/explore/new/all/e2f58f5ada1b46aaa30899996e1bffee',
        },
        {
            title: '物联网/智能硬件 - 无线定位',
            source: ['oshwhub.com/explore?tag=3c3111e1320c48dd8e60e46201140402'],
            target: '/explore/new/all/3c3111e1320c48dd8e60e46201140402',
        },
        {
            title: '物联网/智能硬件 - 4G/5G技术',
            source: ['oshwhub.com/explore?tag=3e9823af89424add8e16c8d86dbe6365'],
            target: '/explore/new/all/3e9823af89424add8e16c8d86dbe6365',
        },
        {
            title: '物联网/智能硬件 - 智能家居',
            source: ['oshwhub.com/explore?tag=f1f6fe3058c4476486baa2d51469c116'],
            target: '/explore/new/all/f1f6fe3058c4476486baa2d51469c116',
        },
        {
            title: '电子模块 - 电源模块',
            source: ['oshwhub.com/explore?tag=2613794836ff4fa2954e4cca5749584a'],
            target: '/explore/new/all/2613794836ff4fa2954e4cca5749584a',
        },
        {
            title: '电子模块 - 显示模块',
            source: ['oshwhub.com/explore?tag=00aa2be7c4d44b5ea060419ca57a94e0'],
            target: '/explore/new/all/00aa2be7c4d44b5ea060419ca57a94e0',
        },
        {
            title: '电子模块 - 通信模块',
            source: ['oshwhub.com/explore?tag=a99c667254ab41f788ffbcb3e78e152b'],
            target: '/explore/new/all/a99c667254ab41f788ffbcb3e78e152b',
        },
        {
            title: '电子模块 - 传感器模块',
            source: ['oshwhub.com/explore?tag=b643637f21ea4464aeb312f29ca0131e'],
            target: '/explore/new/all/b643637f21ea4464aeb312f29ca0131e',
        },
        {
            title: '电子模块 - 电机驱动模块',
            source: ['oshwhub.com/explore?tag=7676fdaf039847e3808481a4437e004b'],
            target: '/explore/new/all/7676fdaf039847e3808481a4437e004b',
        },
        {
            title: '电子模块 - 其他模块',
            source: ['oshwhub.com/explore?tag=22a10af7cd434f1d8c28588b030963c5'],
            target: '/explore/new/all/22a10af7cd434f1d8c28588b030963c5',
        },
        {
            title: '电子应用 - 汽车电子',
            source: ['oshwhub.com/explore?tag=cc45e77e32764600a9edd9c6bec9a932'],
            target: '/explore/new/all/cc45e77e32764600a9edd9c6bec9a932',
        },
        {
            title: '电子应用 - 消费电子',
            source: ['oshwhub.com/explore?tag=e5831c441f25423d88a7311a9b276871'],
            target: '/explore/new/all/e5831c441f25423d88a7311a9b276871',
        },
        {
            title: '电子应用 - 工业电子',
            source: ['oshwhub.com/explore?tag=ba95313da8b24bbfbcf00182447f6063'],
            target: '/explore/new/all/ba95313da8b24bbfbcf00182447f6063',
        },
        {
            title: '电子应用 - 家用电子',
            source: ['oshwhub.com/explore?tag=7bee905a7730453c803339f2a1dc77cf'],
            target: '/explore/new/all/7bee905a7730453c803339f2a1dc77cf',
        },
        {
            title: '电子应用 - 医疗电子',
            source: ['oshwhub.com/explore?tag=b3e25776aa9d438980f140b7577b1af7'],
            target: '/explore/new/all/b3e25776aa9d438980f140b7577b1af7',
        },
        {
            title: '电子应用 - 工业4.0',
            source: ['oshwhub.com/explore?tag=2d6d5c8697cc4061a66e6fb06e30f587'],
            target: '/explore/new/all/2d6d5c8697cc4061a66e6fb06e30f587',
        },
        {
            title: '电子应用 - 开源复刻',
            source: ['oshwhub.com/explore?tag=935421b496b44f178a554fbdaa568e0a'],
            target: '/explore/new/all/935421b496b44f178a554fbdaa568e0a',
        },
        {
            title: '电子应用 - 电子竞赛',
            source: ['oshwhub.com/explore?tag=08a877289c3f4f34b2ca8905996e07ed'],
            target: '/explore/new/all/08a877289c3f4f34b2ca8905996e07ed',
        },
        {
            title: '电子应用 - AI视觉',
            source: ['oshwhub.com/explore?tag=e2d486a270aa46f790318c714cc77d02'],
            target: '/explore/new/all/e2d486a270aa46f790318c714cc77d02',
        },
        {
            title: '电工电子 - 电路分析',
            source: ['oshwhub.com/explore?tag=827cd3b7542646d682f9588973647e96'],
            target: '/explore/new/all/827cd3b7542646d682f9588973647e96',
        },
        {
            title: '电工电子 - 电力电子',
            source: ['oshwhub.com/explore?tag=a08b61928be54154bb1a346f7630e4ba'],
            target: '/explore/new/all/a08b61928be54154bb1a346f7630e4ba',
        },
        {
            title: '电工电子 - 模拟电路',
            source: ['oshwhub.com/explore?tag=858b54c552714ef586fd28705d79e1ec'],
            target: '/explore/new/all/858b54c552714ef586fd28705d79e1ec',
        },
        {
            title: '电工电子 - 数字电路',
            source: ['oshwhub.com/explore?tag=027f0293ca4e4c0e982c3b11f13b64b6'],
            target: '/explore/new/all/027f0293ca4e4c0e982c3b11f13b64b6',
        },
        {
            title: '电工电子 - 高频电路',
            source: ['oshwhub.com/explore?tag=8938b321c55a41b092da9443fcfba334'],
            target: '/explore/new/all/8938b321c55a41b092da9443fcfba334',
        },
        {
            title: '电工电子 - 仿真电路',
            source: ['oshwhub.com/explore?tag=b29c5f43ff8c4f39930174732044842c'],
            target: '/explore/new/all/b29c5f43ff8c4f39930174732044842c',
        },
        {
            title: '电子竞赛/活动 - 星火计划2025',
            source: ['oshwhub.com/explore?tag=9d75d82c34d74d8eb385281a6ebc7fe9'],
            target: '/explore/new/all/9d75d82c34d74d8eb385281a6ebc7fe9',
        },
        {
            title: '电子竞赛/活动 - 彩色丝印',
            source: ['oshwhub.com/explore?tag=4776bafa72df43879ea082ae1345d5bb'],
            target: '/explore/new/all/4776bafa72df43879ea082ae1345d5bb',
        },
        {
            title: '电子竞赛/活动 - 立创大赛',
            source: ['oshwhub.com/explore?tag=f7eefe9c39ff49dabbea446863af30e3'],
            target: '/explore/new/all/f7eefe9c39ff49dabbea446863af30e3',
        },
        {
            title: '电子竞赛/活动 - 互联网+',
            source: ['oshwhub.com/explore?tag=10d9b29096d347629eea7fe3a78eb290'],
            target: '/explore/new/all/10d9b29096d347629eea7fe3a78eb290',
        },
        {
            title: '电子竞赛/活动 - 创新杯/创青春',
            source: ['oshwhub.com/explore?tag=e6920b7defbf47f78e811379ab06b3a2'],
            target: '/explore/new/all/e6920b7defbf47f78e811379ab06b3a2',
        },
        {
            title: '电子竞赛/活动 - FPGA大赛',
            source: ['oshwhub.com/explore?tag=3348af772eb54f769e345c1c6312c3a9'],
            target: '/explore/new/all/3348af772eb54f769e345c1c6312c3a9',
        },
        {
            title: '电子竞赛/活动 - 其他比赛',
            source: ['oshwhub.com/explore?tag=06ed1c7532594f59916f7ce037a6f3ff'],
            target: '/explore/new/all/06ed1c7532594f59916f7ce037a6f3ff',
        },
        {
            title: '电子竞赛/活动 - 星火计划2024',
            source: ['oshwhub.com/explore?tag=5f4e56750b0445a7a024b01cc8fa7122'],
            target: '/explore/new/all/5f4e56750b0445a7a024b01cc8fa7122',
        },
        {
            title: '电子竞赛/活动 - 星火计划2023',
            source: ['oshwhub.com/explore?tag=15637284a6f545128f80a11443cdf1a0'],
            target: '/explore/new/all/15637284a6f545128f80a11443cdf1a0',
        },
        {
            title: '电子设计大赛 - 校内选拔赛',
            source: ['oshwhub.com/explore?tag=b9b469bc5f9f43fbbca7ea1b42ad261f'],
            target: '/explore/new/all/b9b469bc5f9f43fbbca7ea1b42ad261f',
        },
        {
            title: '电子设计大赛 - 省赛/区赛',
            source: ['oshwhub.com/explore?tag=9ba4444f3c4e4c0ca6de5c5473cde4a8'],
            target: '/explore/new/all/9ba4444f3c4e4c0ca6de5c5473cde4a8',
        },
        {
            title: '电子设计大赛 - 2013年电赛',
            source: ['oshwhub.com/explore?tag=9b0656c41291403db63ecdd67d8caf07'],
            target: '/explore/new/all/9b0656c41291403db63ecdd67d8caf07',
        },
        {
            title: '电子设计大赛 - 2015年电赛',
            source: ['oshwhub.com/explore?tag=fe146745542a4dde99883058b5325863'],
            target: '/explore/new/all/fe146745542a4dde99883058b5325863',
        },
        {
            title: '电子设计大赛 - 2019年电赛',
            source: ['oshwhub.com/explore?tag=b3894c65a5ca47f19bab8867da884f04'],
            target: '/explore/new/all/b3894c65a5ca47f19bab8867da884f04',
        },
        {
            title: '电子设计大赛 - 2021年电赛',
            source: ['oshwhub.com/explore?tag=6ccb9fbbd3294c6ba93570c8d35e5310'],
            target: '/explore/new/all/6ccb9fbbd3294c6ba93570c8d35e5310',
        },
        {
            title: '电子设计大赛 - 2023年电赛',
            source: ['oshwhub.com/explore?tag=b1e24499fcdb47c7896baf96b0e40aaa'],
            target: '/explore/new/all/b1e24499fcdb47c7896baf96b0e40aaa',
        },
    ],
    view: ViewType.Articles,
};
