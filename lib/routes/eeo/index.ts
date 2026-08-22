import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:column?/:category?',
    categories: ['traditional-media'],
    example: '/eeo/yaowen/dashi',
    parameters: {
        column: '栏目，见下表，默认为 商业产业',
        category: '分类，见下表，默认为该栏目下所有分类',
    },
    name: '栏目',
    maintainers: ['epirus', 'nczitzk'],
    handler,
    description: `::: tip
以下小标题即栏目 \`column\`，标题下表格中为对应栏目的分类 \`category\`，两者需要配合使用。

如订阅 **时事・政策・宏观** 栏目中的 **大宗商品** 分类，填入 [\`/eeo/yaowen/dzsp\`](https://rsshub.app/eeo/yaowen/dzsp)。

若栏目下没有分类，如 **商业产业** 栏目，直接填入 [\`/eeo/shangyechanye\`](https://rsshub.app/eeo/shangyechanye)。

或者欲订阅该栏目下的所有分类，如订阅 **时事・政策・宏观** 中的所有分类，则直接将分类 \`category\` 留空，即 [\`/eeo/yaowen\`](https://rsshub.app/eeo/yaowen)。
:::

商业产业 shangyechanye [\`/eeo/shangyechanye\`](https://rsshub.app/eeo/shangyechanye)

财经 caijing [\`/eeo/caijing\`](https://rsshub.app/eeo/caijing)

上市公司 ssgsn [\`/eeo/ssgsn\`](https://rsshub.app/eeo/ssgsn)

地产 dichan [\`/eeo/dichan\`](https://rsshub.app/eeo/dichan)

汽车 qiche [\`/eeo/qiche\`](https://rsshub.app/eeo/qiche)

TMT tmt [\`/eeo/tmt\`](https://rsshub.app/eeo/tmt)

评论 pinglun [\`/eeo/pinglun\`](https://rsshub.app/eeo/pinglun)

研究院 yanjiuyuan [\`/eeo/yanjiuyuan\`](https://rsshub.app/eeo/yanjiuyuan)

::: tip 建议
请优先选择订阅以上栏目，下面的栏目大部分已经很久没有更新。
:::

两会 lianghui [\`/eeo/lianghui\`](https://rsshub.app/eeo/lianghui)

时事・政策・宏观 yaowen [\`/eeo/yaowen\`](https://rsshub.app/eeo/yaowen)

| 时事  | 政策   | 宏观    | 智库       | 首席观点 | 大宗商品 |
| ----- | ------ | ------- | ---------- | -------- | -------- |
| dashi | hfggzc | hfshuju | hfdongjian | sxgd     | dzsp     |

证券・资本・理财 jinrong [\`/eeo/jinrong\`](https://rsshub.app/eeo/jinrong)

| 债市    | 资本  | 理财  | 证券      | 银行  |
| ------- | ----- | ----- | --------- | ----- |
| zhaishi | ziben | licai | zhengquan | jijin |

| 保险    | PE / 创投 | 科创板      | 新三板    | 互联网金融 |
| ------- | --------- | ----------- | --------- | ---------- |
| jinkong | chuangtou | kechuangban | xinsanban | hlwjr      |

新科技・互联网・O2O shangye [\`/eeo/shangye\`](https://rsshub.app/eeo/shangye)

| 新科技      | 互联网    | 大健康 | O2O   | 花蕾之约     | 创业家笔记 | 环境     |
| ----------- | --------- | ------ | ----- | ------------ | ---------- | -------- |
| xinnengyuan | dianshang | yiliao | wuliu | hualeizhiyue | cyjbj      | huanjing |

房产・汽车・消费 fcqcxf [\`/eeo/fcqcxf\`](https://rsshub.app/eeo/fcqcxf)

| 房产   | 汽车  | 消费    |
| ------ | ----- | ------- |
| dichan | qiche | xiaofei |

影视・体育・娱乐 yule [\`/eeo/yule\`](https://rsshub.app/eeo/yule)

| 娱乐 | 影视    | 体育 | 教育   |
| ---- | ------- | ---- | ------ |
| yule | yingshi | tiyu | jiaoyu |

观察家・书评・思想 gcj [\`/eeo/gcj\`](https://rsshub.app/eeo/gcj)

| 观察家     | 专栏     | 个人历史 | 书评    |
| ---------- | -------- | -------- | ------- |
| guanchajia | zhuanlan | lishi    | shuping |

| 纵深     | 文化   | 领读   |
| -------- | ------ | ------ |
| zongshen | wenhua | lingdu |`,
};

async function handler(ctx: Context) {
    const { column = 'shangyechanye', category = '' } = ctx.req.param();

    const rootUrl = 'https://www.eeo.com.cn';
    const currentUrl = rootUrl + `/${column}/${category}/`;

    const response = await ofetch(currentUrl, { responseType: 'text' });

    const $ = load(response);

    const list = $('#lyp_article li div span a')
        .slice(0, 15)
        .toArray()
        .map((item) => ({
            link: $(item).attr('href')!,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link, { responseType: 'text' });
                const content = load(detailResponse);

                content('.xd-xd-xd-rwm, .xd_zuozheinfo, .xd-lj, .xd-gg').remove();

                return {
                    ...item,
                    title: content('h1').text(),
                    description: content('.xd-nr').html(),
                    pubDate: timezone(parseDate(content('.thiszihao-box-add').nextUntil('.cls').find('span').eq(0).text()), 8),
                };
            })
        )
    );

    return {
        title: $('title').text().replace('_', ' - '),
        link: currentUrl,
        item: items,
        description: '经济观察网是《经济观察报》社倾力制作的全新商业资讯平台，经济观察网冷静理智的报道风格，并糅合最新的网络技术，拥有专业的采编力量以及独家的新闻报道，为您提供及时、便捷、专业的信息服务。',
    };
}
