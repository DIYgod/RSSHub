// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
const locations = require('./locations');

export default async (ctx) => {
    const categories = {
        0: '精选',
        8: '平面',
        1: '插画',
        17: 'UI',
        607: '网页',
        33: '摄影',
        24: '三维',
        610: '影视',
        609: '空间',
        499: '工业/产品',
        608: '动漫',
        612: '纯艺术',
        611: '手工艺',
        613: '服装',
        44: '其他',
    };

    const subCategories = {
        0: { 617: '运营设计', 9: '包装', 30: '动画/影视', 34: '人像摄影', 2: '商业插画', 616: '电商', 757: 'APP界面', 292: '艺术插画', 637: '家装设计', 10: '海报', 809824: '文章' },
        8: { 9: '包装', 10: '海报', 15: '品牌', 779: 'IP形象', 14: '字体/字形', 13: 'Logo', 12: '书籍/画册', 534: '宣传物料', 624: '图案', 625: '信息图表', 626: 'PPT/Keynote', 11: '其他平面', 809: '文章' },
        1: { 2: '商业插画', 5: '概念设定', 685: '游戏原画', 631: '绘本', 684: '儿童插画', 292: '艺术插画', 7: '创作习作', 3: '新锐潮流插画', 4: '像素画', 819: '文章' },
        17: { 757: 'APP界面', 692: '游戏UI', 621: '软件界面', 20: '图标', 19: '主题/皮肤', 623: '交互/UE', 797: '动效设计', 21: '闪屏/壁纸', 23: '其他UI  ', 822: '文章' },
        607: { 616: '电商', 614: '企业官网', 693: '游戏/娱乐', 617: '运营设计', 777: '移动端网页', 615: '门户网站', 618: '个人网站', 620: '其他网页', 823: '文章' },
        33: { 34: '人像摄影', 35: '风光摄影', 36: '人文/纪实摄影', 825: '美食摄影', 686: '产品摄影', 38: '环境/建筑摄影', 800: '时尚/艺术摄影', 687: '修图/后期', 40: '宠物摄影', 808: '婚礼摄影', 43: '其他摄影', 810: '文章' },
        24: { 30: '动画/影视', 25: '机械/交通', 27: '人物/生物', 807: '产品', 26: '场景', 29: '建筑/空间', 32: '其他三维', 818: '文章' },
        610: { 645: '短片', 649: 'Motion Graphic', 804: '宣传片', 646: '影视后期', 647: '栏目片头', 644: 'MV', 650: '设定/分镜', 651: '其他影视', 817: '文章' },
        609: { 637: '家装设计', 811: '酒店餐饮设计', 641: '商业空间设计', 636: '建筑设计', 638: '舞台美术', 639: '展陈设计', 640: '景观设计', 642: '其他空间', 812: '文章' },
        499: { 508: '生活用品', 506: '电子产品', 509: '交通工具', 511: '工业用品/机械', 510: '人机交互', 689: '玩具', 514: '其他工业/产品', 813: '文章' },
        608: { 628: '短篇/格漫', 629: '中/长篇漫画', 632: '网络表情', 627: '单幅漫画', 633: '动画片', 635: '其他动漫', 820: '文章' },
        612: { 659: '绘画', 662: '雕塑', 668: '书法', 657: '实验艺术', 821: '文章' },
        611: { 654: '工艺品设计', 656: '手办/模玩', 756: '首饰设计', 658: '其他手工艺', 816: '文章' },
        613: { 672: '休闲/流行服饰', 671: '正装/礼服', 814: '传统/民族服饰', 677: '配饰', 676: '鞋履设计', 673: '儿童服饰', 680: '其他服装', 815: '文章' },
        44: { 417: '文案/策划', 798: 'VR设计', 683: '独立游戏', 45: '其他', 824: '文章' },
    };

    const queries = {
        cate: '0',
        subCate: ctx.req.param('subCate') ?? '0',
        city: ctx.req.param('city') ?? '0',
        college: ctx.req.param('college') ?? '0',
        recommendLevel: ctx.req.param('recommendLevel') ?? '2',
        sort: ctx.req.param('sort') ?? '9',
        limit: ctx.req.query('limit') ?? '25',
    };

    let query = ctx.req.param('query') ?? '';

    if (query.includes('=')) {
        for (const q of query.split('&')) {
            const kv = q.split('=');
            queries[kv[0]] = kv[1];
        }
        queries.limit = '25';
        queries.page = '1';
    } else {
        switch (query) {
            case 'home':
                queries.recommendLevel = '3';
                break;
            case 'all':
                queries.recommendLevel = '1';
                break;
            case 'article':
                queries.subCate = '809824';
                queries.recommendLevel = '2';
                break;
            case 'editor' || 'edit':
                queries.recommendLevel = '2';
                break;
            default:
                queries.cate = ctx.req.param('query') ?? '0';
        }
    }

    query = '';

    for (const q in queries) {
        if (q === 'city') {
            queries[q] = queries[q] in locations ? locations[queries.city].toString() : (queries[q] = '0');
        }
        query += `${q}=${queries[q]}&`;
    }

    query = query.slice(0, Math.max(0, query.length - 1));

    const rootUrl = 'https://www.zcool.com.cn';
    const currentUrl = `${rootUrl}/p1/discover/list?${query}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers: {
            Referer: rootUrl,
        },
    });

    const list = response.data.datas.map((item) => ({
        title: item.content.title,
        link: item.content.pageUrl,
        pubDate: parseDate(item.content.publishTime),
        author: item.content.creatorObj.username,
        category: item.content.tags,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                content('.prism-player, .image-info-icons').remove();

                const videos = detailResponse.data.match(/source: '(https:\/\/video\.zcool\.cn\/.*)',/g);

                if (videos) {
                    content('.video-content-box').each(function (i) {
                        if (i >= videos.length) {
                            return;
                        }

                        content(this).append(
                            art(path.join(__dirname, 'templates/description.art'), {
                                video: videos[i].match(/source: '(https:\/\/video\.zcool\.cn\/.*)'/)[1],
                            })
                        );
                    });
                }

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    description: item.link.includes('article') ? content('.articleContentWrapper').html() : content('.workShowBox').parent().html(),
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `站酷 - ${categories[queries.cate]}${queries.subCate === '0' ? '' : ` - ${subCategories[queries.cate][queries.subCate]}`}`,
        link: `${rootUrl}/discover?${query}`,
        item: items,
    });
};
