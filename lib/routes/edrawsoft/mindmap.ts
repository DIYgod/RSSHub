import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/mindmap/:classId?/:order?/:sort?/:lang?/:price?/:search?',
    categories: ['study'],
    example: '/edrawsoft/mindmap/1/PV/DESC/CN/1',
    parameters: {
        classId: '分类编号，见下表，默认为全部分类',
        order: '排序参数，`PV` 指 最多浏览，`TIME` 指 最新发布，`LIKE` 指 最多点赞，默认为 `PV` 即 最多浏览',
        sort: '排序方式，`DESC` 指 降序，`ASC` 指 升序，默认为 `DESC` 即 降序',
        lang: '模板语言，默认为 `CN`',
        price: '是否免费，`1` 指 全部，`2` 指 免费，`3` 指 付费，`4` 指 会员免费，默认为 `1` 即 全部',
        search: '搜索关键词，默认为空',
    },
    name: '热门导图',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
不支持分类搜索和自定义搜索排序，即 \`search\` 参数不为空时，其他参数不起作用。
:::

分类编号如下表（选择全部则填入编号 0）

| 职业技能 | 企业家 / 管理者 | 程序员 | 产品经理 | 运营 / 市场营销 | 人事 / 培训 / 行政 | 法律 / 法务 | 医学 / 药学 / 保健 | 银行 / 金融 / 证券 / 保险 | 电商 / 微商 / 零售 | 编辑 / 媒体 / 出版 | 机械 / 电子 / 制造业 | 城市 / 建筑 / 房地产 | 其他技能 |
| -------- | --------------- | ------ | -------- | --------------- | ------------------ | ----------- | ------------------ | ------------------------- | ------------------ | ------------------ | -------------------- | -------------------- | -------- |
| 1        | 7               | 8      | 9        | 10              | 11                 | 12          | 13                 | 14                        | 15                 | 16                 | 17                   | 58                   | 59       |

| 考研考证 | 研究生考试 | 建考 | 法考 | 教师资格证 | 公考 | 英语 | 医考 | 会计师 | 计算机 | 专升本 |
| -------- | ---------- | ---- | ---- | ---------- | ---- | ---- | ---- | ------ | ------ | ------ |
| 2        | 18         | 19   | 20   | 21         | 22   | 23   | 24   | 25     | 26     | 27     |

| 生活娱乐 | 体育 | 音乐 | 影视 | 旅游 | 游戏 | 兴趣 | 生活 |
| -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 3        | 29   | 30   | 31   | 32   | 33   | 34   | 56   |

| 校园教育 | 大学 | 高中 | 初中 | 小学 | 教育 |
| -------- | ---- | ---- | ---- | ---- | ---- |
| 4        | 35   | 36   | 37   | 38   | 39   |

| 读书笔记 | 文学作品 | 心灵成长 | 经管知识 | 终身学习 | 通用知识 | 知识栏目 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 5        | 40       | 41       | 42       | 43       | 44       | 45       |

| 创意脑图 | 长图 | 鱼骨图 | 时间线 | 圆圈图 | 组织结构 | 树状图 | 流程图 |
| -------- | ---- | ------ | ------ | ------ | -------- | ------ | ------ |
| 6        | 46   | 47     | 48     | 49     | 50       | 51     | 57     |`,
};

async function handler(ctx: Context) {
    const classes = {
        1: '职业技能',
        7: '企业家/管理者',
        8: '程序员',
        9: '产品经理',
        10: '运营/市场营销',
        11: '人事/培训/行政',
        12: '法律/法务',
        13: '医学/药学/保健',
        14: '银行/金融/证券/保险',
        15: '电商/微商/零售',
        16: '编辑/媒体/出版',
        17: '机械/电子/制造业',
        58: '城市/建筑/房地产',
        59: '其他技能',

        2: '考研考证',
        18: '研究生考试',
        19: '建考',
        20: '法考',
        21: '教师资格证',
        22: '公考',
        23: '英语',
        24: '医考',
        25: '会计师',
        26: '计算机',
        27: '专升本',

        3: '生活娱乐',
        29: '体育',
        30: '音乐',
        31: '影视',
        32: '旅游',
        33: '游戏',
        34: '兴趣',
        56: '生活',

        4: '校园教育',
        35: '大学',
        36: '高中',
        37: '初中',
        38: '小学',
        39: '教育',

        5: '读书笔记',
        40: '文学作品',
        41: '心灵成长',
        42: '经管知识',
        43: '终身学习',
        44: '通用知识',
        45: '知识栏目',

        6: '创意脑图',
        46: '长图',
        47: '鱼骨图',
        48: '时间线',
        49: '圆圈图',
        50: '组织结构',
        51: '树状图',
        57: '程图',
    };

    const { classId: classIdParam, order = 'PV', sort = 'DESC', search = '', lang = 'CN', price = '1' } = ctx.req.param();

    const classId = classIdParam && classIdParam !== '0' ? `&classId=${classIdParam}` : '';

    const currentUrl = search
        ? `https://masterapi.edrawsoft.cn/api/publish?offset=0&count=30&order=PV&sort=DESC&search=${search}&lang=CN&price=1`
        : `https://masterapi.edrawsoft.cn/api/publish${classId === '' ? '' : '2'}?offset=0&count=30${classId}&order=${order}&sort=${sort}&lang=${lang}&price=${price}`;

    const response = await ofetch(currentUrl);

    const list = response.data.map((item) => ({
        title: item.title,
        author: item.author,
        link: `https://mm.edrawsoft.cn/template/${item.id}`,
        description: `<p>${item.description}</p><img src="https://edrawcloudpubliccn.oss-cn-shenzhen.aliyuncs.com/${item.url}main.svg">`,
        pubDate: parseDate(item.created_at),
    }));

    return {
        title: `思维导图社区 - ${search === '' ? (classId === '' ? '全部' : classes[classIdParam]) : search}`,
        link: currentUrl,
        item: list,
    };
}
