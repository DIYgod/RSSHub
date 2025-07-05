import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const handler = async (ctx) => {
    const { id = 'c101972' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'http://www.csrc.gov.cn';
    const apiUrl = new URL('getLocalList', rootUrl).href;
    const currentUrl = new URL(`/csrc/${id}/zfxxgk_zdgk.shtml`, rootUrl).href;

    const { data: channelResponse } = await got(apiUrl, {
        searchParams: {
            channelCode: id,
        },
    });

    const channel = channelResponse.results.channelLevel.find((channel) => channel.channelCode === id);
    const channelId = channel?.channelId ?? undefined;
    const channelName = channel?.channelName ?? undefined;

    if (!channelId) {
        throw new InvalidParameterError(`Invalid channel Id: ${id}`);
    }

    const apiSearchUrl = new URL(`searchList/${channelId}`, rootUrl).href;

    const { data: response } = await got(apiSearchUrl, {
        searchParams: {
            _isAgg: true,
            _isJson: true,
            _pageSize: limit,
        },
    });

    const items = response.data.results.slice(0, limit).map((item) => {
        const title = item.title;
        const description = item.contentHtml;
        const enclosure = item.resList?.[0] ?? undefined;

        return {
            title,
            description,
            pubDate: parseDate(item.publishedTime),
            link: item.url,
            category: [item.channelName],
            content: {
                html: description,
                text: item.content,
            },
            enclosure_url: enclosure ? new URL(enclosure.filePath, rootUrl).href : undefined,
            enclosure_type: enclosure ? `application/${enclosure.filePath.split(/\./).pop()}` : undefined,
            enclosure_title: enclosure ? enclosure.title : undefined,
        };
    });

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const description = channelName ?? id;
    const image = new URL($('div.zfxx-logo img').prop('src'), rootUrl).href;
    const author = $('meta[name="SiteName"]').prop('content');

    return {
        title: `${author} - ${description}`,
        description,
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
    };
};

export const route: Route = {
    path: '/csrc/zfxxgk_zdgk/:id?',
    name: '政府信息公开',
    url: 'www.csrc.gov.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/gov/csrc/zfxxgk_zdgk/c101971',
    parameters: { id: '频道 id，默认为 `c101971`，即行政处罚决定，可在对应频道页 URL 中找到' },
    description: `::: tip
  若订阅 [行政处罚决定](http://www.csrc.gov.cn/csrc/c101971/zfxxgk_zdgk.shtml)，网址为 \`http://www.csrc.gov.cn/csrc/c101971/zfxxgk_zdgk.shtml\`。截取 \`http://www.csrc.gov.cn/csrc/\` 到末尾 \`/zfxxgk_zdgk.shtml\` 的部分 \`c101971\` 作为参数填入，此时路由为 [\`/gov/csrc/zfxxgk_zdgk/c101971\`](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101971)。
:::

#### [主动公开目录](http://www.csrc.gov.cn/csrc/c100035/zfxxgk_zdgk.shtml)

| 频道                                                                    | ID                                                         |
| ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| [按主题查看](http://www.csrc.gov.cn/csrc/c101793/zfxxgk_zdgk.shtml)     | [c101793](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101793) |
| [按体裁文种查看](http://www.csrc.gov.cn/csrc/c101951/zfxxgk_zdgk.shtml) | [c101951](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101951) |
| [按派出机构查看](http://www.csrc.gov.cn/csrc/c101985/zfxxgk_zdgk.shtml) | [c101985](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101985) |

<details>
<summary>更多频道</summary>

#### [按主题查看](http://www.csrc.gov.cn/csrc/c101793/zfxxgk_zdgk.shtml)

| 频道                                                                              | ID                                                         |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [综合政务](http://www.csrc.gov.cn/csrc/c101794/zfxxgk_zdgk.shtml)                 | [c101794](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101794) |
| [发行监管](http://www.csrc.gov.cn/csrc/c101801/zfxxgk_zdgk.shtml)                 | [c101801](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101801) |
| [公众公司监管（含北交所）](http://www.csrc.gov.cn/csrc/c101828/zfxxgk_zdgk.shtml) | [c101828](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101828) |
| [证券交易监管](http://www.csrc.gov.cn/csrc/c101832/zfxxgk_zdgk.shtml)             | [c101832](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101832) |
| [证券经营机构监管](http://www.csrc.gov.cn/csrc/c101837/zfxxgk_zdgk.shtml)         | [c101837](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101837) |
| [上市公司监管](http://www.csrc.gov.cn/csrc/c101863/zfxxgk_zdgk.shtml)             | [c101863](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101863) |
| [基金监管](http://www.csrc.gov.cn/csrc/c101876/zfxxgk_zdgk.shtml)                 | [c101876](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101876) |
| [私募基金监管](http://www.csrc.gov.cn/csrc/c101938/zfxxgk_zdgk.shtml)             | [c101938](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101938) |
| [区域性股权市场规范发展](http://www.csrc.gov.cn/csrc/c106301/zfxxgk_zdgk.shtml)   | [c106301](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c106301) |
| [期货监管](http://www.csrc.gov.cn/csrc/c101901/zfxxgk_zdgk.shtml)                 | [c101901](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101901) |
| [债券监管](http://www.csrc.gov.cn/csrc/c106306/zfxxgk_zdgk.shtml)                 | [c106306](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c106306) |
| [行政执法](http://www.csrc.gov.cn/csrc/c101925/zfxxgk_zdgk.shtml)                 | [c101925](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101925) |
| [行政复议](http://www.csrc.gov.cn/csrc/c105938/zfxxgk_zdgk.shtml)                 | [c105938](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c105938) |
| [国际合作](http://www.csrc.gov.cn/csrc/c101931/zfxxgk_zdgk.shtml)                 | [c101931](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101931) |
| [证券服务机构监管](http://www.csrc.gov.cn/csrc/c105939/zfxxgk_zdgk.shtml)         | [c105939](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c105939) |
| [其他](http://www.csrc.gov.cn/csrc/c101950/zfxxgk_zdgk.shtml)                     | [c101950](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101950) |

#### [按体裁文种查看](http://www.csrc.gov.cn/csrc/c101951/zfxxgk_zdgk.shtml)

| 频道                                                                        | ID                                                         |
| --------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [机构职能](http://www.csrc.gov.cn/csrc/c101952/zfxxgk_zdgk.shtml)           | [c101952](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101952) |
| [证监会令](http://www.csrc.gov.cn/csrc/c101953/zfxxgk_zdgk.shtml)           | [c101953](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101953) |
| [证监会公告](http://www.csrc.gov.cn/csrc/c101954/zfxxgk_zdgk.shtml)         | [c101954](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101954) |
| [监管规则适用指引](http://www.csrc.gov.cn/csrc/c105948/zfxxgk_zdgk.shtml)   | [c105948](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c105948) |
| [行政许可批复](http://www.csrc.gov.cn/csrc/c101955/zfxxgk_zdgk.shtml)       | [c101955](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101955) |
| [办事指南](http://www.csrc.gov.cn/csrc/c101968/zfxxgk_zdgk.shtml)           | [c101968](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101968) |
| [监管对象](http://www.csrc.gov.cn/csrc/c101969/zfxxgk_zdgk.shtml)           | [c101969](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101969) |
| [统计信息](http://www.csrc.gov.cn/csrc/c101970/zfxxgk_zdgk.shtml)           | [c101970](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101970) |
| [行政处罚决定](http://www.csrc.gov.cn/csrc/c101971/zfxxgk_zdgk.shtml)       | [c101971](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101971) |
| [市场禁入决定](http://www.csrc.gov.cn/csrc/c101972/zfxxgk_zdgk.shtml)       | [c101972](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101972) |
| [行政执法当事人承诺](http://www.csrc.gov.cn/csrc/c106416/zfxxgk_zdgk.shtml) | [c106416](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c106416) |
| [行政复议](http://www.csrc.gov.cn/csrc/c101973/zfxxgk_zdgk.shtml)           | [c101973](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101973) |
| [监管措施](http://www.csrc.gov.cn/csrc/c105955/zfxxgk_zdgk.shtml)           | [c105955](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c105955) |
| [预先披露](http://www.csrc.gov.cn/csrc/c101974/zfxxgk_zdgk.shtml)           | [c101974](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101974) |
| [发审会公告](http://www.csrc.gov.cn/csrc/c101975/zfxxgk_zdgk.shtml)         | [c101975](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101975) |
| [重组委公告](http://www.csrc.gov.cn/csrc/c101976/zfxxgk_zdgk.shtml)         | [c101976](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101976) |
| [规划报告](http://www.csrc.gov.cn/csrc/c101977/zfxxgk_zdgk.shtml)           | [c101977](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101977) |
| [非行政许可事项](http://www.csrc.gov.cn/csrc/c101978/zfxxgk_zdgk.shtml)     | [c101978](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101978) |
| [其他](http://www.csrc.gov.cn/csrc/c101979/zfxxgk_zdgk.shtml)               | [c101979](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101979) |
| [备案管理](http://www.csrc.gov.cn/csrc/c106402/zfxxgk_zdgk.shtml)           | [c106402](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c106402) |

#### [按派出机构查看](http://www.csrc.gov.cn/csrc/c101985/zfxxgk_zdgk.shtml)

| 频道                                                                | ID                                                         |
| ------------------------------------------------------------------- | ---------------------------------------------------------- |
| [北京](http://www.csrc.gov.cn/csrc/c101986/zfxxgk_zdgk.shtml)       | [c101986](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101986) |
| [天津](http://www.csrc.gov.cn/csrc/c101987/zfxxgk_zdgk.shtml)       | [c101987](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101987) |
| [河北](http://www.csrc.gov.cn/csrc/c101988/zfxxgk_zdgk.shtml)       | [c101988](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101988) |
| [山西](http://www.csrc.gov.cn/csrc/c101989/zfxxgk_zdgk.shtml)       | [c101989](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101989) |
| [内蒙古](http://www.csrc.gov.cn/csrc/c101990/zfxxgk_zdgk.shtml)     | [c101990](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101990) |
| [辽宁](http://www.csrc.gov.cn/csrc/c101991/zfxxgk_zdgk.shtml)       | [c101991](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101991) |
| [吉林](http://www.csrc.gov.cn/csrc/c101992/zfxxgk_zdgk.shtml)       | [c101992](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101992) |
| [黑龙江](http://www.csrc.gov.cn/csrc/c101993/zfxxgk_zdgk.shtml)     | [c101993](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101993) |
| [上海](http://www.csrc.gov.cn/csrc/c101994/zfxxgk_zdgk.shtml)       | [c101994](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101994) |
| [江苏](http://www.csrc.gov.cn/csrc/c101995/zfxxgk_zdgk.shtml)       | [c101995](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101995) |
| [浙江](http://www.csrc.gov.cn/csrc/c101996/zfxxgk_zdgk.shtml)       | [c101996](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101996) |
| [安徽](http://www.csrc.gov.cn/csrc/c101997/zfxxgk_zdgk.shtml)       | [c101997](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101997) |
| [福建](http://www.csrc.gov.cn/csrc/c101998/zfxxgk_zdgk.shtml)       | [c101998](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101998) |
| [江西](http://www.csrc.gov.cn/csrc/c101999/zfxxgk_zdgk.shtml)       | [c101999](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101999) |
| [山东](http://www.csrc.gov.cn/csrc/c102000/zfxxgk_zdgk.shtml)       | [c102000](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102000) |
| [河南](http://www.csrc.gov.cn/csrc/c102001/zfxxgk_zdgk.shtml)       | [c102001](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102001) |
| [湖北](http://www.csrc.gov.cn/csrc/c102002/zfxxgk_zdgk.shtml)       | [c102002](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102002) |
| [湖南](http://www.csrc.gov.cn/csrc/c102003/zfxxgk_zdgk.shtml)       | [c102003](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102003) |
| [广东](http://www.csrc.gov.cn/csrc/c102004/zfxxgk_zdgk.shtml)       | [c102004](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102004) |
| [广西](http://www.csrc.gov.cn/csrc/c102005/zfxxgk_zdgk.shtml)       | [c102005](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102005) |
| [海南](http://www.csrc.gov.cn/csrc/c102006/zfxxgk_zdgk.shtml)       | [c102006](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102006) |
| [重庆](http://www.csrc.gov.cn/csrc/c102007/zfxxgk_zdgk.shtml)       | [c102007](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102007) |
| [四川](http://www.csrc.gov.cn/csrc/c102008/zfxxgk_zdgk.shtml)       | [c102008](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102008) |
| [贵州](http://www.csrc.gov.cn/csrc/c102009/zfxxgk_zdgk.shtml)       | [c102009](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102009) |
| [云南](http://www.csrc.gov.cn/csrc/c102010/zfxxgk_zdgk.shtml)       | [c102010](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102010) |
| [西藏](http://www.csrc.gov.cn/csrc/c102011/zfxxgk_zdgk.shtml)       | [c102011](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102011) |
| [陕西](http://www.csrc.gov.cn/csrc/c102012/zfxxgk_zdgk.shtml)       | [c102012](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102012) |
| [甘肃](http://www.csrc.gov.cn/csrc/c102013/zfxxgk_zdgk.shtml)       | [c102013](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102013) |
| [青海](http://www.csrc.gov.cn/csrc/c102014/zfxxgk_zdgk.shtml)       | [c102014](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102014) |
| [宁夏](http://www.csrc.gov.cn/csrc/c102015/zfxxgk_zdgk.shtml)       | [c102015](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102015) |
| [新疆](http://www.csrc.gov.cn/csrc/c102016/zfxxgk_zdgk.shtml)       | [c102016](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102016) |
| [深圳](http://www.csrc.gov.cn/csrc/c102017/zfxxgk_zdgk.shtml)       | [c102017](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102017) |
| [大连](http://www.csrc.gov.cn/csrc/c102018/zfxxgk_zdgk.shtml)       | [c102018](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102018) |
| [宁波](http://www.csrc.gov.cn/csrc/c102019/zfxxgk_zdgk.shtml)       | [c102019](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102019) |
| [厦门](http://www.csrc.gov.cn/csrc/c102020/zfxxgk_zdgk.shtml)       | [c102020](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102020) |
| [青岛](http://www.csrc.gov.cn/csrc/c102021/zfxxgk_zdgk.shtml)       | [c102021](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c102021) |
| [上海专员办](http://www.csrc.gov.cn/csrc/c105841/zfxxgk_zdgk.shtml) | [c105841](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c105841) |
| [深圳专员办](http://www.csrc.gov.cn/csrc/c105842/zfxxgk_zdgk.shtml) | [c105842](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c105842) |

#### [综合政务](http://www.csrc.gov.cn/csrc/c101794/zfxxgk_zdgk.shtml)

| 频道                                                                                    | ID                                                         |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [组织机构](http://www.csrc.gov.cn/csrc/c101795/zfxxgk_zdgk.shtml)                       | [c101795](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101795) |
| [征求意见](http://www.csrc.gov.cn/csrc/c101796/zfxxgk_zdgk.shtml)                       | [c101796](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101796) |
| [废止规章](http://www.csrc.gov.cn/csrc/c101797/zfxxgk_zdgk.shtml)                       | [c101797](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101797) |
| [财务预算管理](http://www.csrc.gov.cn/csrc/c105887/zfxxgk_zdgk.shtml)                   | [c105887](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c105887) |
| [其他](http://www.csrc.gov.cn/csrc/c101799/zfxxgk_zdgk.shtml)                           | [c101799](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101799) |
| [全国人大建议和政协提案复文公开](http://www.csrc.gov.cn/csrc/c101800/zfxxgk_zdgk.shtml) | [c101800](https://rsshub.app/gov/csrc/zfxxgk_zdgk/c101800) |

</details>
    `,
    categories: ['government'],

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
            source: ['www.csrc.gov.cn/csrc/:id/zfxxgk_zdgk.shtml'],
            target: (params) => {
                const id = params.id;

                return `/gov/csrc/zfxxgk_zdgk/${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '主动公开目录 - 按主题查看',
            source: ['www.csrc.gov.cn/csrc/c101793/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101793',
        },
        {
            title: '主动公开目录 - 按体裁文种查看',
            source: ['www.csrc.gov.cn/csrc/c101951/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101951',
        },
        {
            title: '主动公开目录 - 按派出机构查看',
            source: ['www.csrc.gov.cn/csrc/c101985/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101985',
        },
        {
            title: '按主题查看 - 综合政务',
            source: ['www.csrc.gov.cn/csrc/c101794/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101794',
        },
        {
            title: '按主题查看 - 发行监管',
            source: ['www.csrc.gov.cn/csrc/c101801/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101801',
        },
        {
            title: '按主题查看 - 公众公司监管（含北交所）',
            source: ['www.csrc.gov.cn/csrc/c101828/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101828',
        },
        {
            title: '按主题查看 - 证券交易监管',
            source: ['www.csrc.gov.cn/csrc/c101832/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101832',
        },
        {
            title: '按主题查看 - 证券经营机构监管',
            source: ['www.csrc.gov.cn/csrc/c101837/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101837',
        },
        {
            title: '按主题查看 - 上市公司监管',
            source: ['www.csrc.gov.cn/csrc/c101863/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101863',
        },
        {
            title: '按主题查看 - 基金监管',
            source: ['www.csrc.gov.cn/csrc/c101876/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101876',
        },
        {
            title: '按主题查看 - 私募基金监管',
            source: ['www.csrc.gov.cn/csrc/c101938/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101938',
        },
        {
            title: '按主题查看 - 区域性股权市场规范发展',
            source: ['www.csrc.gov.cn/csrc/c106301/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c106301',
        },
        {
            title: '按主题查看 - 期货监管',
            source: ['www.csrc.gov.cn/csrc/c101901/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101901',
        },
        {
            title: '按主题查看 - 债券监管',
            source: ['www.csrc.gov.cn/csrc/c106306/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c106306',
        },
        {
            title: '按主题查看 - 行政执法',
            source: ['www.csrc.gov.cn/csrc/c101925/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101925',
        },
        {
            title: '按主题查看 - 行政复议',
            source: ['www.csrc.gov.cn/csrc/c105938/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c105938',
        },
        {
            title: '按主题查看 - 国际合作',
            source: ['www.csrc.gov.cn/csrc/c101931/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101931',
        },
        {
            title: '按主题查看 - 证券服务机构监管',
            source: ['www.csrc.gov.cn/csrc/c105939/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c105939',
        },
        {
            title: '按主题查看 - 其他',
            source: ['www.csrc.gov.cn/csrc/c101950/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101950',
        },
        {
            title: '按派出机构查看 - 北京',
            source: ['www.csrc.gov.cn/csrc/c101986/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101986',
        },
        {
            title: '按派出机构查看 - 天津',
            source: ['www.csrc.gov.cn/csrc/c101987/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101987',
        },
        {
            title: '按派出机构查看 - 河北',
            source: ['www.csrc.gov.cn/csrc/c101988/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101988',
        },
        {
            title: '按派出机构查看 - 山西',
            source: ['www.csrc.gov.cn/csrc/c101989/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101989',
        },
        {
            title: '按派出机构查看 - 内蒙古',
            source: ['www.csrc.gov.cn/csrc/c101990/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101990',
        },
        {
            title: '按派出机构查看 - 辽宁',
            source: ['www.csrc.gov.cn/csrc/c101991/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101991',
        },
        {
            title: '按派出机构查看 - 吉林',
            source: ['www.csrc.gov.cn/csrc/c101992/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101992',
        },
        {
            title: '按派出机构查看 - 黑龙江',
            source: ['www.csrc.gov.cn/csrc/c101993/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101993',
        },
        {
            title: '按派出机构查看 - 上海',
            source: ['www.csrc.gov.cn/csrc/c101994/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101994',
        },
        {
            title: '按派出机构查看 - 江苏',
            source: ['www.csrc.gov.cn/csrc/c101995/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101995',
        },
        {
            title: '按派出机构查看 - 浙江',
            source: ['www.csrc.gov.cn/csrc/c101996/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101996',
        },
        {
            title: '按派出机构查看 - 安徽',
            source: ['www.csrc.gov.cn/csrc/c101997/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101997',
        },
        {
            title: '按派出机构查看 - 福建',
            source: ['www.csrc.gov.cn/csrc/c101998/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101998',
        },
        {
            title: '按派出机构查看 - 江西',
            source: ['www.csrc.gov.cn/csrc/c101999/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101999',
        },
        {
            title: '按派出机构查看 - 山东',
            source: ['www.csrc.gov.cn/csrc/c102000/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102000',
        },
        {
            title: '按派出机构查看 - 河南',
            source: ['www.csrc.gov.cn/csrc/c102001/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102001',
        },
        {
            title: '按派出机构查看 - 湖北',
            source: ['www.csrc.gov.cn/csrc/c102002/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102002',
        },
        {
            title: '按派出机构查看 - 湖南',
            source: ['www.csrc.gov.cn/csrc/c102003/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102003',
        },
        {
            title: '按派出机构查看 - 广东',
            source: ['www.csrc.gov.cn/csrc/c102004/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102004',
        },
        {
            title: '按派出机构查看 - 广西',
            source: ['www.csrc.gov.cn/csrc/c102005/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102005',
        },
        {
            title: '按派出机构查看 - 海南',
            source: ['www.csrc.gov.cn/csrc/c102006/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102006',
        },
        {
            title: '按派出机构查看 - 重庆',
            source: ['www.csrc.gov.cn/csrc/c102007/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102007',
        },
        {
            title: '按派出机构查看 - 四川',
            source: ['www.csrc.gov.cn/csrc/c102008/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102008',
        },
        {
            title: '按派出机构查看 - 贵州',
            source: ['www.csrc.gov.cn/csrc/c102009/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102009',
        },
        {
            title: '按派出机构查看 - 云南',
            source: ['www.csrc.gov.cn/csrc/c102010/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102010',
        },
        {
            title: '按派出机构查看 - 西藏',
            source: ['www.csrc.gov.cn/csrc/c102011/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102011',
        },
        {
            title: '按派出机构查看 - 陕西',
            source: ['www.csrc.gov.cn/csrc/c102012/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102012',
        },
        {
            title: '按派出机构查看 - 甘肃',
            source: ['www.csrc.gov.cn/csrc/c102013/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102013',
        },
        {
            title: '按派出机构查看 - 青海',
            source: ['www.csrc.gov.cn/csrc/c102014/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102014',
        },
        {
            title: '按派出机构查看 - 宁夏',
            source: ['www.csrc.gov.cn/csrc/c102015/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102015',
        },
        {
            title: '按派出机构查看 - 新疆',
            source: ['www.csrc.gov.cn/csrc/c102016/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102016',
        },
        {
            title: '按派出机构查看 - 深圳',
            source: ['www.csrc.gov.cn/csrc/c102017/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102017',
        },
        {
            title: '按派出机构查看 - 大连',
            source: ['www.csrc.gov.cn/csrc/c102018/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102018',
        },
        {
            title: '按派出机构查看 - 宁波',
            source: ['www.csrc.gov.cn/csrc/c102019/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102019',
        },
        {
            title: '按派出机构查看 - 厦门',
            source: ['www.csrc.gov.cn/csrc/c102020/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102020',
        },
        {
            title: '按派出机构查看 - 青岛',
            source: ['www.csrc.gov.cn/csrc/c102021/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c102021',
        },
        {
            title: '按派出机构查看 - 上海专员办',
            source: ['www.csrc.gov.cn/csrc/c105841/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c105841',
        },
        {
            title: '按派出机构查看 - 深圳专员办',
            source: ['www.csrc.gov.cn/csrc/c105842/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c105842',
        },
        {
            title: '综合政务 - 组织机构',
            source: ['www.csrc.gov.cn/csrc/c101795/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101795',
        },
        {
            title: '综合政务 - 征求意见',
            source: ['www.csrc.gov.cn/csrc/c101796/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101796',
        },
        {
            title: '综合政务 - 废止规章',
            source: ['www.csrc.gov.cn/csrc/c101797/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101797',
        },
        {
            title: '综合政务 - 财务预算管理',
            source: ['www.csrc.gov.cn/csrc/c105887/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c105887',
        },
        {
            title: '综合政务 - 其他',
            source: ['www.csrc.gov.cn/csrc/c101799/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101799',
        },
        {
            title: '综合政务 - 全国人大建议和政协提案复文公开',
            source: ['www.csrc.gov.cn/csrc/c101800/zfxxgk_zdgk.shtml'],
            target: '/csrc/zfxxgk_zdgk/c101800',
        },
    ],
};
