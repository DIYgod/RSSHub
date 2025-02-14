import { Route } from '@/types';
import utils from './utils';
import { load } from 'cheerio';
import got from '@/utils/got';

export const route: Route = {
    path: '/list/:id',
    categories: ['new-media', 'popular'],
    example: '/thepaper/list/25457',
    parameters: { id: '栏目 id，可在栏目页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '栏目',
    maintainers: ['nczitzk', 'bigfei'],
    handler,
    description: `| 栏目 ID | 栏目名       |
| ------- | ------------ |
| 26912   | 上直播       |
| 26913   | 七环视频     |
| 26965   | 温度计       |
| 26908   | 一级视场     |
| 27260   | World 湃     |
| 26907   | 湃客科技     |
| 33168   | 纪录湃       |
| 26911   | 围观         |
| 26918   | @所有人      |
| 26906   | 大都会       |
| 26909   | 追光灯       |
| 26910   | 运动装       |
| 26914   | 健寻记       |
| 82188   | AI 播报      |
| 89035   | 眼界         |
| 92278   | 关键帧       |
| 90069   | 战疫         |
| 25462   | 中国政库     |
| 25488   | 中南海       |
| 97924   | 初心之路     |
| 25489   | 舆论场       |
| 25490   | 打虎记       |
| 25423   | 人事风向     |
| 25426   | 法治中国     |
| 25424   | 一号专案     |
| 25463   | 港台来信     |
| 25491   | 长三角政商   |
| 25428   | 直击现场     |
| 68750   | 公益湃       |
| 27604   | 暖闻         |
| 25464   | 澎湃质量报告 |
| 25425   | 绿政公署     |
| 25429   | 澎湃国际     |
| 25481   | 外交学人     |
| 25430   | 澎湃防务     |
| 25678   | 唐人街       |
| 25427   | 澎湃人物     |
| 25422   | 浦江头条     |
| 25487   | 教育家       |
| 25634   | 全景现场     |
| 25635   | 美数课       |
| 25600   | 快看         |
| 25434   | 10% 公司     |
| 25436   | 能见度       |
| 25433   | 地产界       |
| 25438   | 财经上下游   |
| 25435   | 金改实验室   |
| 25437   | 牛市点线面   |
| 119963  | IPO 最前线   |
| 25485   | 澎湃商学院   |
| 25432   | 自贸区连线   |
| 37978   | 进博会在线   |
| 36079   | 湃客         |
| 27392   | 政务         |
| 77286   | 媒体         |
| 27234   | 科学湃       |
| 119445  | 生命科学     |
| 119447  | 未来 2%      |
| 119446  | 元宇宙观察   |
| 119448  | 科创 101     |
| 119449  | 科学城邦     |
| 25444   | 社论         |
| 27224   | 澎湃评论     |
| 26525   | 思想湃       |
| 26878   | 上海书评     |
| 25483   | 思想市场     |
| 25457   | 私家历史     |
| 25574   | 翻书党       |
| 25455   | 艺术评论     |
| 26937   | 古代艺术     |
| 25450   | 文化课       |
| 25482   | 逝者         |
| 25536   | 专栏         |
| 26506   | 异次元       |
| 97313   | 海平面       |
| 103076  | 一问三知     |
| 25445   | 澎湃研究所   |
| 25446   | 全球智库     |
| 26915   | 城市漫步     |
| 25456   | 市政厅       |
| 104191  | 世界会客厅   |
| 25448   | 有戏         |
| 26609   | 文艺范       |
| 25942   | 身体         |
| 26015   | 私・奔       |
| 25599   | 运动家       |
| 25842   | 私家地理     |
| 80623   | 非常品       |
| 26862   | 楼市         |
| 25769   | 生活方式     |
| 25990   | 澎湃联播     |
| 26173   | 视界         |
| 26202   | 亲子学堂     |
| 26404   | 赢家         |
| 26490   | 汽车圈       |
| 115327  | IP SH        |
| 117340  | 酒业         |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const list_url = `https://m.thepaper.cn/list/${id}`;
    const list_url_resp = await got(list_url);
    const list_url_data = JSON.parse(load(list_url_resp.data)('#__NEXT_DATA__').html());

    const resp = await got.post('https://api.thepaper.cn/contentapi/nodeCont/getByNodeIdPortal', {
        json: {
            nodeId: id,
        },
    });
    const pagePropsData = resp.data.data;
    const list = pagePropsData.list;

    const items = await Promise.all(list.map((item) => utils.ProcessItem(item, ctx)));
    return {
        title: `澎湃新闻栏目 - ${utils.ListIdToName(id, list_url_data)}`,
        link: list_url,
        item: items,
        itunes_author: '澎湃新闻',
        image: pagePropsData.nodeInfo?.pic ?? utils.ExtractLogo(list_url_resp),
    };
}
