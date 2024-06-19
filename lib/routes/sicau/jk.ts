import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jk/:gid/:typeId/:sortType/:token',
    categories: ['university'],
    example: '/sicau/jk/0/0/2/8d95466cf63e537292b303cb92b5958c',
    parameters: {
        gid: '活动所属组织ID，见下表',
        typeId: '活动类别ID，见下表',
        sortType: '排序方式，见下表',
        token: '访问令牌，可通过示例中的令牌直接访问（会过期）',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '二课活动',
    maintainers: ['hualiong'],
    url: 'jk.sicau.edu.cn',
    description: `

:::tip
**本校学生**可以直接 POST \`https://jk.sicau.edu.cn/user/login/v1.0.0/snoLogin\` 从返回结果中的 \`token\` 字段拿到个人令牌，记得在url后添加以下**查询参数**：

-   sid: \`f1c97a0e81c24e98adb1ebdadca0699b\`
-   loginName: \`你的学号\`
-   password: \`你的i川农密码\`

:::

:::warning
由于i川农后台有请求限制，为避免一次性大量请求而被限流，每次只请求结果的第一页数据，即前20条
:::

**活动所属组织ID：**

| ID   | 组织                 | ID   | 组织               | ID   | 组织                   | ID   | 组织                   |
| ---- | -------------------- | ---- | ------------------ | ---- | ---------------------- | ---- | ---------------------- |
| 0    | 全部组织             | 14   | 校纪委             | 28   | 食品学院               | 42   | 经济学院               |
| 1    | 管理学院             | 15   | 生命科学学院       | 29   | 环境学院               | 43   | 机电学院               |
| 2    | 学生心理健康服务中心 | 16   | 水利水电学院       | 30   | 国家重点实验室         | 44   | 都江堰校区综合办后管科 |
| 3    | 档案馆               | 17   | 国合处             | 31   | 党委统战部             | 45   | 园艺学院               |
| 4    | 马克思主义学院       | 18   | 商旅学院           | 32   | 草业科技学院           | 46   | 资源学院               |
| 5    | 都江堰校区党政办     | 19   | 风景园林学院       | 33   | 商学院                 | 47   | 学生处                 |
| 6    | 土木工程学院         | 20   | 建筑与城乡规划学院 | 34   | 党委组织部             | 48   | 农学院                 |
| 7    | 林学院               | 21   | 体育学院           | 35   | 校团委                 | 49   | 公共管理学院           |
| 8    | 动物医学院           | 22   | 校体委             | 36   | 法学院                 | 50   | 图书馆                 |
| 9    | 保卫处               | 23   | 校区团委           | 37   | 水稻研究所             | 51   | 校学生会               |
| 10   | 理学院               | 24   | 后勤管理处         | 38   | 研究生院               | 52   | 动物科技学院           |
| 11   | 艺术与传媒学院       | 25   | 教务处             | 39   | 后勤服务总公司         | 53   | 信息工程学院           |
| 12   | 大学生艺术团         | 26   | 人文学院           | 40   | 招生就业处             |      |                        |
| 13   | 都江堰校区基础教学部 | 27   | 党委宣传部         | 41   | 学生社团管理与服务中心 |      |                        |

**活动类别ID：**

| ID   | 组织             | ID   | 组织                 | ID   | 组织           |
| ---- | ---------------- | ---- | -------------------- | ---- | -------------- |
| 0    | 所有类别         | 5    | 校本文化（校规校纪） | 10   | 体质测试       |
| 1    | 党团学习         | 6    | 德育—社会实践        | 11   | 文化艺术活动   |
| 2    | 学生干部社会工作 | 7    | 创新创业类           | 12   | 文艺演出或讲座 |
| 3    | 校院班任务       | 8    | 科技学术讲座         | 13   | 劳动教育       |
| 4    | 德育（志愿公益） | 9    | 体育活动（新）       |      |                |

**排序方式：**

| 即将开始 | 最新活动 | 可参与 |
| -------  | -------- | -------- |
| 1     | 2     | 4     |
`,
    handler: async (ctx) => {
        const { gid, typeId, sortType, token } = ctx.req.param();
        const $post = ofetch.create({
            baseURL: 'https://jk.sicau.edu.cn/act/actInfo/v1.0.0',
            headers: { 'x-access-token': token },
            method: 'post',
        });
        const query = async (page: number) =>
            await $post(`/getUserSchoolActList`, {
                query: {
                    gid: gidDict[gid],
                    typeId: typeDict[typeId],
                    sortType,
                    page,
                },
            });

        const res = await Promise.all([query(1), query(2)]);

        for (const each of res) {
            if (each.code !== '0') {
                throw new Error(each.message);
            }
        }

        const list: DataItem[] = [...res[0].content, ...res[1].content]
            .filter((e) => e.statusName !== '待发学时')
            .map((each) => ({
                id: each.id,
                guid: each.id,
                title: each.title,
                image: each.logo,
            }));

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(String(item.id), async () => {
                    const { code, message, content } = await $post(`/getActDetail?actId=${item.id}`);
                    if (code === '0') {
                        item.author = content.groupName;
                        item.pubDate = timezone(parseDate(content.startDate, 'YYYY-MM-DD HH:mm:ss'), +8);
                        item.category = [content.typeName, content.levelName];
                        item.description = `<img src="${item.image}" alt="${item.title}" /><p style='white-space: pre-wrap'>${content.description}</p>`;

                        return item;
                    }
                    throw new Error(message);
                })
            )
        );

        return {
            title: '二课活动 - 四川农业大学',
            link: 'https://jk.sicau.edu.cn/act/actInfo/v1.0.0/getUserSchoolActList',
            language: 'zh-cn',
            item: items as DataItem[],
        };
    },
};

const typeDict = {
    '0': '',
    '1': '17a3b11f2d254518b13406ccd18a85b5',
    '2': '000392a845ff47d09978c6ddd6dda2d4',
    '3': '9ead58d01d3d424ea70b194910893660',
    '4': 'e233038099914313950ad9058e4c7176',
    '5': 'ccdec1bf8a32497998a4d2b3285e8fa0',
    '6': '1db34972f7b247a6a60aac15285870d5',
    '7': '3a230729aac44b3aa0127c8cdcf15555',
    '8': '0157365febe548ee86848dd58c7b8b4b',
    '9': 'fe94059a28e5440fb1097679b4744981',
    '10': '5b91902f42854301ae60d30018f8786c',
    '11': '1cee1aea9994489286fe2a7d42b6e21e',
    '12': '4f7a37aa8ca2452dbf5f44fc7cfa2679',
    '13': '7969c78baee34a6f90e029d95db18592',
};

const gidDict = {
    '0': '',
    '1': '075c882582bf4392b5f858e18169c6fa',
    '2': '0b6869479c1d4e69b01afa73534ddf7e',
    '3': '0b9b91adfcc2494190a06b6ceb33136c',
    '4': '0d0ad5dca6f24f3290c5dc62c9e534bf',
    '5': '0e0d4803c89a419fa2c87ea415cf0efc',
    '6': '11944f4920c645e3936a429f4da48165',
    '7': '13968d883e2146febd41fea97b8e935c',
    '8': '16e9229a200e4644ac9d283f44dfbd8c',
    '9': '1838c6d0dd394ffebe5305a8efaabd24',
    '10': '1bb0a81892a74ca792dbf726521284bc',
    '11': '1cad939489de4868bcbba1366dc454e8',
    '12': '22ddaea411e44df68bdb614d2e97cea1',
    '13': '23fd994f03ca4174b364b371a67dcacd',
    '14': '2a1fb8567c0e4c1b93d82259b8f784f6',
    '15': '2a5f3f75505140cc897c2187b3dcf91a',
    '16': '5016d53f98164d9c81484acbbc6b761d',
    '17': '56e1f5bea3ab4921b2e3bb37bfbdf629',
    '18': '597d5baff6ab469992d4ecb54f7b4c38',
    '19': '607a4eefcbd549018c2e253c60b227de',
    '20': '61e0696b35da46a69cbd57e2a415e919',
    '21': '67c4d8cdaf04456eae344f01e67e0ca0',
    '22': '70f29b197d8945be8c6f9714a1923057',
    '23': '78d0b179286845e9b589cb27c5b2b3b4',
    '24': '7cf23874959a4827b8c15c9f7b99eb64',
    '25': '82d71d8ada514858ab30e5f58e64706e',
    '26': '89c9be371ab8498499f0b3aff520f4c4',
    '27': '8b459d361d4b493b918656710104a4a7',
    '28': '8cd045b1390146fd8d5ad155db8b59e1',
    '29': '8f231145f3664726beb551378e1f5d99',
    '30': '97062a27a31e40a7a5be49475e3df099',
    '31': 'ae9e85188f084cb3be8a0fa3ebf6c7b5',
    '32': 'b88245cc3c9c47f8ab121ad5c2fa3282',
    '33': 'ba368a3503274da781c1960ba084793f',
    '34': 'be4149fac2394326b19270e3b70fd704',
    '35': 'be68e601768b4e57830bbceb829a2942',
    '36': 'c514507d08d3415e965abf84d9dfd31b',
    '37': 'c7d5a7b282854f14aafb22ed69abef7a',
    '38': 'ca1423660dd940439af1921a5c48e521',
    '39': 'd09f1391b0de4667aaf8ed6313582667',
    '40': 'd393b583269e420f93cf7cf07ef7b694',
    '41': 'd79d6ef35687400da1c3106080ad294a',
    '42': 'd850db1a4811420f934ef7c783ba72b1',
    '43': 'd8f1ecac920346b79650fbd2783c9a86',
    '44': 'dba67112679e4df2892a8896ac2cb898',
    '45': 'dd7345a743c6464fafdded750c08a4d8',
    '46': 'dfa126fc8e494259bf3d88d61afca53e',
    '47': 'e1f80975b5e940f3a3e416ac45e79ce8',
    '48': 'ea117c42071a40b5b08423b392bc5722',
    '49': 'f4017020fe9a456599754c88c1d9a341',
    '50': 'f548b78687094c428085dfb0b064ed32',
    '51': 'fa5098c59a9c4db6b287744049053762',
    '52': 'fccf2f15e15a479ba9b5564efee436c7',
    '53': 'fcf30bbdd8004026ae9b447f2722aecf',
};
