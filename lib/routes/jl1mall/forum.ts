import { type Data, type DataItem, type Route, ViewType } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type Context } from 'hono';

type MainIdsResult = {
    name: string | undefined;
    racer2: string | undefined;
    racer3: string | undefined;
};

const findMainIds = (data: readonly any[], searchKey: string): MainIdsResult => {
    const recurse = (currentList: readonly any[], parentMainId: string | undefined = undefined, grandParentMainId: string | undefined = undefined): MainIdsResult => {
        for (const item of currentList) {
            const isMatch = item.mainId === searchKey || item.name === searchKey;

            if (isMatch) {
                if (grandParentMainId !== undefined) {
                    return {
                        name: item.name as string,
                        racer2: grandParentMainId,
                        racer3: item.mainId as string,
                    };
                } else if (parentMainId !== undefined) {
                    return {
                        name: item.name as string,
                        racer2: item.mainId as string,
                        racer3: undefined,
                    };
                }
            }

            const nextList = item.nextList;

            if (Array.isArray(nextList) && nextList.length > 0) {
                const result = recurse(nextList, item.mainId as string | undefined, parentMainId);

                return result;
            }
        }

        return {
            name: undefined,
            racer2: undefined,
            racer3: undefined,
        };
    };

    return recurse(data);
};

export const handler = async (ctx: Context): Promise<Data> => {
    const { type = '2', key } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://www.jl1mall.com';
    const targetUrl: string = new URL('forum', baseUrl).href;
    const apiUrl: string = new URL(`postApi/${type === 'recommend' ? 'recommend' : 'post'}/getPostData`, baseUrl).href;
    const apiRacerUrl: string = new URL('postApi/racer/getRacerList', baseUrl).href;

    const racerResponse = await ofetch(apiRacerUrl);
    const racerData = racerResponse.data;

    const { name, ...mainIds } = findMainIds(racerData, key);

    const response = await ofetch(apiUrl, {
        query: {
            pageNum: 1,
            pageSize: limit,
            type: type === 'recommend' ? undefined : type,
            ...mainIds,
        },
    });

    const language = 'zh';

    const items: DataItem[] = response.data.records.slice(0, limit).map((item): DataItem => {
        const title: string = item.postTitle;
        const description: string | undefined = item.contentMarkdown;
        const pubDate: number | string = item.dateTime;
        const linkUrl: string | undefined = new URL(`forum/PostDetail?postId=${item.postId}`, baseUrl).href;
        const categories: string[] = [...new Set([...(item.customTagArray ?? []), ...(item.topic?.split(/,/) ?? []), item.address, item.fromSource, item.typeName].filter(Boolean))];
        const authors: DataItem['author'] = item.fromUserName
            ? [
                  {
                      name: item.fromUserName,
                      url: item.fromUid ? new URL(`forum/otherPage?otherUserId=${item.fromUid}`, baseUrl).href : undefined,
                      avatar: item.avatar,
                  },
              ]
            : undefined;
        const guid: string = `jl1mall-${item.postId}`;
        const image: string | undefined = item.pictureLink;
        const updated: number | string = pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? timezone(parseDate(pubDate), +8) : undefined,
            link: linkUrl,
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
            updated: updated ? timezone(parseDate(updated), +8) : undefined,
            language,
        };

        return processedItem;
    });

    const title: string = '星林社区';

    return {
        title: name ? `${title} - ${name}` : title,
        description: name,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/forum/:type?/:key?',
    name: '星林社区',
    url: 'www.jl1mall.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/jl1mall/forum/2',
    parameters: {
        type: {
            description: '类型，默认为 `2`，即最新',
            options: [
                {
                    label: '推荐',
                    value: 'recommend',
                },
                {
                    label: '热门',
                    value: '1',
                },
                {
                    label: '最新',
                    value: '2',
                },
            ],
        },
        key: {
            description: '关键字，默认为全部',
            options: [
                {
                    label: '遥感开发者培训班',
                    value: '20240520150900005395',
                },
                {
                    label: '吉林一号杯创新大赛',
                    value: '202405201509000193524',
                },
                {
                    label: '安全与情报分析',
                    value: '20240828170700012219',
                },
                {
                    label: '农业农村',
                    value: '202306141504000458181',
                },
                {
                    label: '生态环保',
                    value: '202306141504000549335',
                },
                {
                    label: '城市建设',
                    value: '20230614150500000306',
                },
                {
                    label: '金融投资',
                    value: '202306141505000067369',
                },
                {
                    label: '应急减灾',
                    value: '202306141505000133827',
                },
                {
                    label: '地球科学',
                    value: '202306141514000061581',
                },
                {
                    label: '固体地球物理学',
                    value: '202306141517000575939',
                },
                {
                    label: '地球化学',
                    value: '202306141518000085359',
                },
                {
                    label: '地图学',
                    value: '202306141518000157744',
                },
                {
                    label: '地质学',
                    value: '202306141518000241039',
                },
                {
                    label: '海洋科学',
                    value: '202306141518000393987',
                },
                {
                    label: '大气科学',
                    value: '202306141529000041839',
                },
                {
                    label: '空间物理学',
                    value: '202306141529000242849',
                },
                {
                    label: '大地测量学',
                    value: '202306141529000425495',
                },
                {
                    label: '地理学',
                    value: '202306141530000014753',
                },
                {
                    label: '水文学',
                    value: '202306141530000174894',
                },
                {
                    label: '测绘科学技术',
                    value: '20230614151500026119',
                },
                {
                    label: '大地测量技术',
                    value: '202306141520000005256',
                },
                {
                    label: '摄影测量与遥感技术',
                    value: '202306141520000106520',
                },
                {
                    label: '地图制图技术',
                    value: '202306141520000178541',
                },
                {
                    label: '工程测量技术',
                    value: '202306141520000258701',
                },
                {
                    label: '海洋测绘',
                    value: '202306141520000324966',
                },
                {
                    label: '测绘仪器',
                    value: '202306141520000414316',
                },
                {
                    label: '农学',
                    value: '202306141515000341910',
                },
                {
                    label: '农业基础学科',
                    value: '202306141521000277547',
                },
                {
                    label: '农艺学',
                    value: '202306141521000365043',
                },
                {
                    label: '园艺学',
                    value: '202306141521000438505',
                },
                {
                    label: '土壤学',
                    value: '202306141521000505344',
                },
                {
                    label: '植物保护学',
                    value: '202306141522000009366',
                },
                {
                    label: '农业工程',
                    value: '202306141522000082860',
                },
                {
                    label: '林学',
                    value: '202306141515000385043',
                },
                {
                    label: '林业基础学科',
                    value: '202306141522000436479',
                },
                {
                    label: '森林培育学',
                    value: '20230614152200051361',
                },
                {
                    label: '林木遗传育种学',
                    value: '202306141523000295017',
                },
                {
                    label: '森林经理学',
                    value: '202306141523000466296',
                },
                {
                    label: '森林保护学',
                    value: '202306141523000531935',
                },
                {
                    label: '野生动物保护与管理',
                    value: '202306141523000595037',
                },
                {
                    label: '防护林学',
                    value: '202306141524000045940',
                },
                {
                    label: '经济林学',
                    value: '202306141524000113348',
                },
                {
                    label: '园林学',
                    value: '202306141524000179836',
                },
                {
                    label: '林业工程',
                    value: '202306141524000235618',
                },
                {
                    label: '森林统计学',
                    value: '202306141524000289370',
                },
                {
                    label: '林业经济学',
                    value: '202306141524000339222',
                },
                {
                    label: '环境科学技术',
                    value: '20230614151500047789',
                },
                {
                    label: '环境科学技术基础学科',
                    value: '202306141535000054532',
                },
                {
                    label: '环境学',
                    value: '202306141535000112080',
                },
                {
                    label: '环境工程学',
                    value: '202306141535000231152',
                },
                {
                    label: '计算机科学技术',
                    value: '202306141515000576514',
                },
                {
                    label: '计算机科学技术基础学科',
                    value: '202306141542000549959',
                },
                {
                    label: '人工智能',
                    value: '202306141543000006811',
                },
                {
                    label: '计算机系统结构',
                    value: '202306141543000067343',
                },
                {
                    label: '计算机软件',
                    value: '202306141543000131149',
                },
                {
                    label: '计算机工程',
                    value: '2023061415430002541',
                },
                {
                    label: '计算机应用',
                    value: '202306141543000301013',
                },
                {
                    label: '水利工程',
                    value: '20230614151600024423',
                },
                {
                    label: '水利工程基础学科',
                    value: '202306141548000086089',
                },
                {
                    label: '水利工程测量',
                    value: '202306141548000124678',
                },
                {
                    label: '水工材料',
                    value: '202306141548000185107',
                },
                {
                    label: '水工结构',
                    value: '202306141548000324892',
                },
                {
                    label: '水力机械',
                    value: '202306141548000395969',
                },
                {
                    label: '水利工程施工',
                    value: '20230614154800046627',
                },
                {
                    label: '水处理',
                    value: '202306141548000525441',
                },
                {
                    label: '河流泥沙工程学',
                    value: '202306141548000576930',
                },
                {
                    label: '海洋工程',
                    value: '202306141549000036382',
                },
                {
                    label: '环境水利',
                    value: '202306141549000098809',
                },
                {
                    label: '水利管理',
                    value: '202306141549000142714',
                },
                {
                    label: '防洪工程',
                    value: '202306141549000206899',
                },
                {
                    label: '水利经济学',
                    value: '202306141549000273808',
                },
                {
                    label: '矿山工程技术',
                    value: '202306141516000327936',
                },
                {
                    label: '矿山地质学',
                    value: '202306141550000508559',
                },
                {
                    label: '矿山测量',
                    value: '202306141550000555267',
                },
                {
                    label: '矿山设计',
                    value: '202306141551000009480',
                },
                {
                    label: '矿山地面工程',
                    value: '202306141551000059854',
                },
                {
                    label: '井巷工程',
                    value: '202306141551000091874',
                },
                {
                    label: '采矿工程',
                    value: '202306141551000145716',
                },
                {
                    label: '选矿工程',
                    value: '202306141551000196626',
                },
                {
                    label: '钻井工程',
                    value: '202306141551000242890',
                },
                {
                    label: '油气田井开发工程',
                    value: '202306141551000281559',
                },
                {
                    label: '矿山机械工程',
                    value: '202306141551000444214',
                },
                {
                    label: '石油、天然气储存与运输工程',
                    value: '202306141551000496258',
                },
                {
                    label: '矿山电气工程',
                    value: '20230614155100054576',
                },
                {
                    label: '采矿环境工程',
                    value: '202306141551000586807',
                },
                {
                    label: '矿山安全',
                    value: '202306141552000015381',
                },
                {
                    label: '矿山综合利用工程',
                    value: '202306141552000058779',
                },
                {
                    label: '地信系统',
                    value: '202306141507000026855',
                },
                {
                    label: 'Web前端',
                    value: '202306141507000175842',
                },
                {
                    label: 'Web后端',
                    value: '202307101453000087320',
                },
                {
                    label: '部署运维',
                    value: '202306141609000132025',
                },
                {
                    label: '移动端',
                    value: '202307101453000139149',
                },
                {
                    label: '目标识别',
                    value: '202306141509000181523',
                },
                {
                    label: '语义分割',
                    value: '202306141509000243978',
                },
                {
                    label: '时序分析',
                    value: '202306141509000328187',
                },
                {
                    label: '样本标注',
                    value: '202306141614000383945',
                },
                {
                    label: '制图工具',
                    value: '202306141615000281579',
                },
                {
                    label: '矢量数据处理',
                    value: '20230614161700031265',
                },
                {
                    label: '地物分类',
                    value: '20230710114400052654',
                },
                {
                    label: '变化检测',
                    value: '202307101145000028636',
                },
                {
                    label: '定量反演',
                    value: '202307101347000522903',
                },
                {
                    label: 'QGIS',
                    value: '202307101101000417309',
                },
                {
                    label: 'ArcGIS',
                    value: '202307101102000009946',
                },
                {
                    label: 'LabelImg',
                    value: '20230710110200008240',
                },
                {
                    label: 'uDig',
                    value: '20230710110200016279',
                },
                {
                    label: 'ENVI',
                    value: '202307101102000384177',
                },
                {
                    label: 'GEE',
                    value: '202307101103000459525',
                },
                {
                    label: '其他',
                    value: '202307101103000548964',
                },
                {
                    label: 'Python',
                    value: '202306141647000449681',
                },
                {
                    label: 'Matlab',
                    value: '202306141647000532735',
                },
                {
                    label: 'C++',
                    value: '202306141647000574253',
                },
                {
                    label: 'JAVA',
                    value: '202307101453000516747',
                },
                {
                    label: 'JavaScript',
                    value: '202307101509000578236',
                },
                {
                    label: 'Kotlin',
                    value: '202307101558000228562',
                },
                {
                    label: 'Dart',
                    value: '202307101608000249435',
                },
                {
                    label: '领域咨询',
                    value: '202306141647000349567',
                },
            ],
        },
    },
    description: `:::tip
订阅 [星林社区遥感开发者培训班的最新内容](https://www.jl1mall.com/forum/)，此时路由为 [\`/jl1mall/forum/2/\`](https://rsshub.app/jl1mall/forum/2/遥感开发者培训班)。
:::
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
            title: '推荐',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/recommend',
        },
        {
            title: '热门',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/1',
        },
        {
            title: '最新',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2',
        },
        {
            title: '特别专区',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202405201508000363847',
        },
        {
            title: '遥感开发者培训班',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/20240520150900005395',
        },
        {
            title: '吉林一号杯创新大赛',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202405201509000193524',
        },
        {
            title: '应用领域',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141504000029820',
        },
        {
            title: '安全与情报分析',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/20240828170700012219',
        },
        {
            title: '农业农村',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141504000458181',
        },
        {
            title: '生态环保',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141504000549335',
        },
        {
            title: '城市建设',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/20230614150500000306',
        },
        {
            title: '金融投资',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141505000067369',
        },
        {
            title: '应急减灾',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141505000133827',
        },
        {
            title: '学科名称',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141504000106265',
        },
        {
            title: '地球科学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141514000061581',
        },
        {
            title: '固体地球物理学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141517000575939',
        },
        {
            title: '地球化学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141518000085359',
        },
        {
            title: '地图学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141518000157744',
        },
        {
            title: '地质学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141518000241039',
        },
        {
            title: '海洋科学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141518000393987',
        },
        {
            title: '大气科学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141529000041839',
        },
        {
            title: '空间物理学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141529000242849',
        },
        {
            title: '大地测量学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141529000425495',
        },
        {
            title: '地理学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141530000014753',
        },
        {
            title: '水文学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141530000174894',
        },
        {
            title: '测绘科学技术',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/20230614151500026119',
        },
        {
            title: '大地测量技术',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141520000005256',
        },
        {
            title: '摄影测量与遥感技术',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141520000106520',
        },
        {
            title: '地图制图技术',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141520000178541',
        },
        {
            title: '工程测量技术',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141520000258701',
        },
        {
            title: '海洋测绘',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141520000324966',
        },
        {
            title: '测绘仪器',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141520000414316',
        },
        {
            title: '农学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141515000341910',
        },
        {
            title: '农业基础学科',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141521000277547',
        },
        {
            title: '农艺学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141521000365043',
        },
        {
            title: '园艺学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141521000438505',
        },
        {
            title: '土壤学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141521000505344',
        },
        {
            title: '植物保护学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141522000009366',
        },
        {
            title: '农业工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141522000082860',
        },
        {
            title: '林学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141515000385043',
        },
        {
            title: '林业基础学科',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141522000436479',
        },
        {
            title: '森林培育学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/20230614152200051361',
        },
        {
            title: '林木遗传育种学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141523000295017',
        },
        {
            title: '森林经理学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141523000466296',
        },
        {
            title: '森林保护学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141523000531935',
        },
        {
            title: '野生动物保护与管理',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141523000595037',
        },
        {
            title: '防护林学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141524000045940',
        },
        {
            title: '经济林学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141524000113348',
        },
        {
            title: '园林学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141524000179836',
        },
        {
            title: '林业工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141524000235618',
        },
        {
            title: '森林统计学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141524000289370',
        },
        {
            title: '林业经济学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141524000339222',
        },
        {
            title: '环境科学技术',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/20230614151500047789',
        },
        {
            title: '环境科学技术基础学科',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141535000054532',
        },
        {
            title: '环境学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141535000112080',
        },
        {
            title: '环境工程学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141535000231152',
        },
        {
            title: '计算机科学技术',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141515000576514',
        },
        {
            title: '计算机科学技术基础学科',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141542000549959',
        },
        {
            title: '人工智能',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141543000006811',
        },
        {
            title: '计算机系统结构',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141543000067343',
        },
        {
            title: '计算机软件',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141543000131149',
        },
        {
            title: '计算机工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/2023061415430002541',
        },
        {
            title: '计算机应用',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141543000301013',
        },
        {
            title: '水利工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/20230614151600024423',
        },
        {
            title: '水利工程基础学科',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141548000086089',
        },
        {
            title: '水利工程测量',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141548000124678',
        },
        {
            title: '水工材料',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141548000185107',
        },
        {
            title: '水工结构',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141548000324892',
        },
        {
            title: '水力机械',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141548000395969',
        },
        {
            title: '水利工程施工',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/20230614154800046627',
        },
        {
            title: '水处理',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141548000525441',
        },
        {
            title: '河流泥沙工程学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141548000576930',
        },
        {
            title: '海洋工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141549000036382',
        },
        {
            title: '环境水利',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141549000098809',
        },
        {
            title: '水利管理',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141549000142714',
        },
        {
            title: '防洪工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141549000206899',
        },
        {
            title: '水利经济学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141549000273808',
        },
        {
            title: '矿山工程技术',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141516000327936',
        },
        {
            title: '矿山地质学',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141550000508559',
        },
        {
            title: '矿山测量',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141550000555267',
        },
        {
            title: '矿山设计',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141551000009480',
        },
        {
            title: '矿山地面工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141551000059854',
        },
        {
            title: '井巷工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141551000091874',
        },
        {
            title: '采矿工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141551000145716',
        },
        {
            title: '选矿工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141551000196626',
        },
        {
            title: '钻井工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141551000242890',
        },
        {
            title: '油气田井开发工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141551000281559',
        },
        {
            title: '矿山机械工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141551000444214',
        },
        {
            title: '石油、天然气储存与运输工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141551000496258',
        },
        {
            title: '矿山电气工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/20230614155100054576',
        },
        {
            title: '采矿环境工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141551000586807',
        },
        {
            title: '矿山安全',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141552000015381',
        },
        {
            title: '矿山综合利用工程',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141552000058779',
        },
        {
            title: '软件开发',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141506000485537',
        },
        {
            title: '地信系统',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141507000026855',
        },
        {
            title: 'Web前端',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141507000175842',
        },
        {
            title: 'Web后端',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202307101453000087320',
        },
        {
            title: '部署运维',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141609000132025',
        },
        {
            title: '移动端',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202307101453000139149',
        },
        {
            title: '信息解译',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141508000116074',
        },
        {
            title: '目标识别',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141509000181523',
        },
        {
            title: '语义分割',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141509000243978',
        },
        {
            title: '时序分析',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141509000328187',
        },
        {
            title: '样本标注',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141614000383945',
        },
        {
            title: '制图工具',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141615000281579',
        },
        {
            title: '矢量数据处理',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/20230614161700031265',
        },
        {
            title: '地物分类',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/20230710114400052654',
        },
        {
            title: '变化检测',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202307101145000028636',
        },
        {
            title: '定量反演',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202307101347000522903',
        },
        {
            title: '工具软件',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141647000009469',
        },
        {
            title: 'QGIS',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202307101101000417309',
        },
        {
            title: 'ArcGIS',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202307101102000009946',
        },
        {
            title: 'LabelImg',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/20230710110200008240',
        },
        {
            title: 'uDig',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/20230710110200016279',
        },
        {
            title: 'ENVI',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202307101102000384177',
        },
        {
            title: 'GEE',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202307101103000459525',
        },
        {
            title: '其他',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202307101103000548964',
        },
        {
            title: '编程语言',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141647000105840',
        },
        {
            title: 'Python',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141647000449681',
        },
        {
            title: 'Matlab',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141647000532735',
        },
        {
            title: 'C++',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141647000574253',
        },
        {
            title: 'JAVA',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202307101453000516747',
        },
        {
            title: 'JavaScript',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202307101509000578236',
        },
        {
            title: 'Kotlin',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202307101558000228562',
        },
        {
            title: 'Dart',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202307101608000249435',
        },
        {
            title: '其他',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141647000212675',
        },
        {
            title: '领域咨询',
            source: ['www.jl1mall.com/forum/'],
            target: '/forum/2/202306141647000349567',
        },
    ],
    view: ViewType.Articles,
};
