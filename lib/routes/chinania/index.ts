import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

const rootUrl = 'https://www.chinania.org.cn';
const description = `:::tip
中国有色金属工业协会（China Non-Ferrous Metals Industry Association）是由我国有色金属行业的企业、事业单位、社会团体为实现共同意愿而自愿组成的全国性、非营利性、行业性的经济类社会团体，是依法成立的社团法人。
:::
|类别\`type\`|子类别\`subtype\`|
|---|----|
|协会动态 \`xiehuidongtai\`|协会动态 \`xiehuidongtai\` <br/> 协会通知 \`xiehuitongzhi\` <br/>有色企业50强 \`youseqiye50qiang\`|
|党建工作 \`djgz\`|协会党建 \`xiehuidangjian\` <br/>行业党建 \`hangyedangjian\`|
|行业新闻\`hangyexinwen\`|时政要闻\`shizhengyaowen\`<br/>要闻\`yaowen\`<br/>行业新闻\`guoneixinwen\`<br/>资讯\`zixun\`|
|人力资源\`renliziyuan\`|相关通知\`xiangguantongzhi\`<br/>人事招聘\`renshizhaopin\`|
|行业统计\`hangyetongji\`|行业分析\`tongji\`<br/>数据统计\`chanyeshuju\`<br/>景气指数\`jqzs\`|
|政策法规\`zcfg\`|政策法规\`zhengcefagui\`|
|会议展览\`hyzl\`|会展通知\`huiyizhanlan\`<br/>会展报道\`huizhanbaodao\`|
`;
const typeenum = {
    xiehuidongtai: '协会动态',
    djgz: '党建工作',
    hangyexinwen: '行业新闻',
    renliziyuan: '人力资源',
    hangyetongji: '行业统计',
    zcfg: '政策法规',
    hyzl: '会议展览',
};
const subtypeenum = {
    xiehuidongtai: '协会动态',
    xiehuitongzhi: '协会通知',
    youseqiye50qiang: '有色企业50强',
    xiehuidangjian: '协会党建',
    hangyedangjian: '行业党建',
    shizhengyaowen: '时政要闻',
    yaowen: '要闻',
    guoneixinwen: '行业新闻',
    zixun: '资讯',
    xiangguantongzhi: '相关通知',
    renshizhaopin: '人事招聘',
    tongji: '行业分析',
    chanyeshuju: '数据统计',
    jqzs: '景气指数',
    zhengcefagui: '政策法规',
    huiyizhanlan: '会展通知',
    huizhanbaodao: '会展报道',
};

const handler = async (ctx) => {
    const { type, subtype } = ctx.req.param();
    const currentUrl = `${rootUrl}/html/${type}/${subtype}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = load(response.data);
    const list = $('ul.notice_list_ul>li>a')
        .toArray()
        .map((item) => ({
            link: $(item).attr('href'),
            title: $(item).find('div p:eq(0)').text(),
            pubDate: parseDate($(item).find('div p:eq(1)').text()),
        }));
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                item.description = item.link.includes('www.news.cn') ? content('#detailContent').html() : content('.article_content').html();
                return item;
            })
        )
    );
    return {
        title: '中国有色金属工业网-' + typeenum[type] + '-' + subtypeenum[subtype],
        link: currentUrl,
        description,
        language: 'zh-cn',
        item: items,
    };
};

export const route: Route = {
    path: '/:type/:subtype',
    categories: ['government'],
    description,
    radar: [
        {
            source: ['www.chinania.org.cn/html/:type/:subtype'],
            target: '/:type/:subtype',
        },
    ],
    name: '中国有色金属工业网',
    maintainers: ['murphysking'],
    handler,
    url: 'www.chinania.org.cn/',
    example: '行业统计-行业分析  `hangyetongji/tongji`',
};
