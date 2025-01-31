import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

/**
 * Parses a tree array and returns an array of objects containing the key-value pairs.
 * @param {Array} tree - The tree to parse.
 * @param {Array} result - The result array to store the parsed key-value pairs. Default is an empty array.
 *
 * @returns {Array} - An array of objects containing the key-value pairs.
 */
const parseTree = (tree, result = []) => {
    for (const obj of tree) {
        const { key, value, children } = obj;
        result.push({ key, value });

        if (children && children.length > 0) {
            parseTree(children, result);
        }
    }

    return result;
};

export const route: Route = {
    path: '/report/:industry?/:label?',
    categories: ['new-media', 'popular'],
    example: '/questmobile/report',
    parameters: { industry: '行业，见下表，默认为 `-1`，即全部行业', label: '标签，见下表，默认为 `-1`，即全部标签' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '行业研究报告',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
  若订阅行业 [互联网行业](https://www.questmobile.com.cn/research/reports/1/-1)，网址为 \`https://www.questmobile.com.cn/research/reports/1/-1\`
  参数 industry 为 \`互联网行业\` 或 \`1\`，此时路由为 [\`/questmobile/report/互联网行业\`](https://rsshub.app/questmobile/report/互联网行业) 或 [\`/questmobile/report/1/-1\`](https://rsshub.app/questmobile/report/1/-1)。

  若订阅标签 [榜单](https://www.questmobile.com.cn/research/reports/-1/11)，网址为 \`https://www.questmobile.com.cn/research/reports/-1/11\`
  参数 label 为 \`榜单\` 或 \`11\`，此时路由为 [\`/questmobile/report/榜单\`](https://rsshub.app/questmobile/report/榜单) 或 [\`/questmobile/report/-1/11\`](https://rsshub.app/questmobile/report/-1/11)。

  若订阅行业和标签 [品牌领域 - 互联网经济](https://www.questmobile.com.cn/research/reports/2/1)，网址为 \`https://www.questmobile.com.cn/research/reports/2/1\`
  参数 industry 为 \`品牌领域\` 或 \`2\`，参数 label 为 \`互联网经济\` 或 \`1\`，此时路由为 [\`/questmobile/report/品牌领域/互联网经济\`](https://rsshub.app/questmobile/report/品牌领域/互联网经济) 或 [\`/questmobile/report/2/1\`](https://rsshub.app/questmobile/report/2/1)，甚至 [\`/questmobile/report/品牌领域/1\`](https://rsshub.app/questmobile/report/品牌领域/1)。
:::

<details>
<summary>全部行业和标签</summary>

#### 行业

| 互联网行业 | 移动社交 | 移动视频 | 移动购物 | 系统工具 |
| ---------- | -------- | -------- | -------- | -------- |
| 1          | 1001     | 1002     | 1003     | 1004     |

| 出行服务 | 金融理财 | 生活服务 | 移动音乐 | 新闻资讯 |
| -------- | -------- | -------- | -------- | -------- |
| 1005     | 1006     | 1007     | 1008     | 1009     |

| 办公商务 | 手机游戏 | 实用工具 | 数字阅读 | 教育学习 |
| -------- | -------- | -------- | -------- | -------- |
| 1010     | 1011     | 1012     | 1013     | 1014     |

| 汽车服务 | 拍摄美化 | 智能设备 | 旅游服务 | 健康美容 |
| -------- | -------- | -------- | -------- | -------- |
| 1015     | 1016     | 1017     | 1018     | 1020     |

| 育儿母婴 | 主题美化 | 医疗服务 | 品牌领域 | 美妆品牌 |
| -------- | -------- | -------- | -------- | -------- |
| 1022     | 1023     | 1024     | 2        | 2001     |

| 母婴品牌 | 家电品牌 | 食品饮料品牌 | 汽车品牌 | 服饰箱包品牌 |
| -------- | -------- | ------------ | -------- | ------------ |
| 2002     | 2003     | 2004         | 2005     | 2006         |

#### 标签

| 互联网经济 | 圈层经济 | 粉丝经济 | 银发经济 | 儿童经济 |
| ---------- | -------- | -------- | -------- | -------- |
| 1          | 1001     | 1002     | 1004     | 1005     |

| 萌宠经济 | 她经济 | 他经济 | 泛娱乐经济 | 下沉市场经济 |
| -------- | ------ | ------ | ---------- | ------------ |
| 1007     | 1009   | 1010   | 1011       | 1012         |

| 内容经济 | 订阅经济 | 会员经济 | 居家经济 | 到家经济 |
| -------- | -------- | -------- | -------- | -------- |
| 1013     | 1014     | 1015     | 1016     | 1017     |

| 颜值经济 | 闲置经济 | 旅游经济            | 人群洞察 | 00 后 |
| -------- | -------- | ------------------- | -------- | ----- |
| 1018     | 1020     | 1622842051677753346 | 2        | 2002  |

| Z 世代 | 银发族 | 宝妈宝爸 | 萌宠人群 | 运动达人 |
| ------ | ------ | -------- | -------- | -------- |
| 2003   | 2004   | 2005     | 2007     | 2008     |

| 女性消费 | 男性消费 | 游戏人群 | 二次元 | 新中产 |
| -------- | -------- | -------- | ------ | ------ |
| 2009     | 2010     | 2012     | 2013   | 2014   |

| 下沉市场用户 | 大学生 | 数字化营销 | 广告效果 | 品牌营销 |
| ------------ | ------ | ---------- | -------- | -------- |
| 2018         | 2022   | 3          | 3001     | 3002     |

| 全域营销 | 私域流量 | 新媒体营销 | KOL 生态 | 内容营销 |
| -------- | -------- | ---------- | -------- | -------- |
| 3003     | 3004     | 3005       | 3006     | 3008     |

| 直播电商 | 短视频带货 | 娱乐营销            | 营销热点 | 双 11 电商大促 |
| -------- | ---------- | ------------------- | -------- | -------------- |
| 3009     | 3010       | 1630464311158738945 | 4        | 4001           |

| 618 电商大促 | 春节营销 | 五一假期营销 | 热点事件盘点 | 消费热点 |
| ------------ | -------- | ------------ | ------------ | -------- |
| 4002         | 4003     | 4004         | 4007         | 5        |

| 时尚品牌 | 连锁餐饮 | 新式茶饮 | 智能家电 | 国潮品牌 |
| -------- | -------- | -------- | -------- | -------- |
| 5001     | 5002     | 5003     | 5004     | 5007     |

| 白酒品牌            | 精益运营 | 媒介策略 | 用户争夺 | 精细化运营 |
| ------------------- | -------- | -------- | -------- | ---------- |
| 1622841828310093825 | 6        | 6001     | 6002     | 6003       |

| 用户分层 | 增长黑马 | 社交裂变 | 新兴领域 | 新能源汽车 |
| -------- | -------- | -------- | -------- | ---------- |
| 6004     | 6005     | 6007     | 7        | 7001       |

| 智能汽车 | 新消费 | AIoT | 产业互联网 | AIGC                |
| -------- | ------ | ---- | ---------- | ------------------- |
| 7002     | 7003   | 7004 | 7005       | 1645677998450511873 |

| OTT 应用            | 智能电视            | 全景数据 | 全景生态 | 微信小程序 |
| ------------------- | ------------------- | -------- | -------- | ---------- |
| 1676063510499528705 | 1676063630293045249 | 8        | 8001     | 8002       |

| 支付宝小程序 | 百度智能小程序 | 企业流量            | 抖音小程序          | 手机终端 |
| ------------ | -------------- | ------------------- | ------------------- | -------- |
| 8003         | 8004           | 1671052842096496642 | 1676063017220018177 | 9        |

| 智能终端 | 国产终端 | 5G 手机 | 盘点 | 季度报告 |
| -------- | -------- | ------- | ---- | -------- |
| 9001     | 9002     | 9003    | 10   | 10001    |
</details>`,
};

async function handler(ctx) {
    const { industry, label } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'https://www.questmobile.com.cn';
    const apiUrl = new URL('api/v2/report/article-list', rootUrl).href;
    const apiTreeUrl = new URL('api/v2/report/industry-label-tree', rootUrl).href;

    const {
        data: {
            data: { industryTree, labelTree },
        },
    } = await got(apiTreeUrl);

    const industries = parseTree(industryTree);
    const labels = parseTree(labelTree);

    const industryObj = industry ? industries.find((i) => i.key === industry || i.value === industry) : undefined;
    const labelObj = label ? labels.find((i) => i.key === label || i.value === label) : industryObj ? undefined : labels.find((i) => i.key === industry || i.value === industry);

    const industryId = industryObj?.key ?? -1;
    const labelId = labelObj?.key ?? -1;

    const currentUrl = new URL(`research/reports/${industryObj?.key ?? -1}/${labelObj?.key ?? -1}`, rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            version: 0,
            pageSize: limit,
            pageNo: 1,
            industryId,
            labelId,
        },
    });

    let items = response.data.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(`research/report/${item.id}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            image: {
                src: item.coverImgUrl,
                alt: item.title,
            },
            introduction: item.introduction,
            description: item.content,
        }),
        category: [...(item.industryList ?? []), ...(item.labelList ?? [])],
        guid: `questmobile-report#${item.id}`,
        pubDate: parseDate(item.publishTime),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('div.text div.daoyu').remove();

                item.title = content('div.title h1').text();
                item.description += art(path.join(__dirname, 'templates/description.art'), {
                    description: content('div.text').html(),
                });
                item.author = content('div.source')
                    .text()
                    .replace(/^.*?：/, '');
                item.category = content('div.hy, div.keyword')
                    .find('span')
                    .toArray()
                    .map((c) => content(c).text());
                item.pubDate = parseDate(content('div.data span').prop('datetime'));

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const author = $('meta[property="og:title"]').prop('content').split(/-/)[0];
    const categories = [industryObj?.value, labelObj?.value].filter(Boolean);
    const image = $(`img[alt="${author}"]`).prop('src');
    const icon = $('link[rel="shortcut icon"]').prop('href');

    return {
        item: items,
        title: `${author}${categories.length === 0 ? '' : ` - ${categories.join(' - ')}`}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
        allowEmpty: true,
    };
}
