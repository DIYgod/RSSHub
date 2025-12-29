import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface Book {
    bibId: string;
    inBooklist: number;
    thumb: string;
    holdingTypes: string[];
    author: string;
    callno: string[];
    docType: string;
    onSelfDate: string;
    groupId: string;
    isbn: string;
    inDate: number;
    language: string;
    bibNo: string;
    abstract: string;
    docTypeDesc: string;
    title: string;
    itemCount: number;
    tags: string[];
    circCount: number;
    pub_year: string;
    classno: string;
    publisher: string;
    holdings: string;
}

interface Holding {
    classMethod: string;
    callNo: string;
    inDate: number;
    shelfMark: string;
    itemsCount: number;
    barCode: string;
    tempLocation: string;
    circStatus: number;
    itemId: number;
    vol: string;
    library: string;
    itemStatus: string;
    itemsAvailable: number;
    location: string;
    extenStatus: number;
    donatorId: null;
    status: string;
    locationName: string;
}

interface Info {
    _id: string;
    imageUrl: string | null;
    authorInfo: string;
    catalog: string | null;
    content: string;
    title: string;
}

export const route: Route = {
    path: String.raw`/lib/space/:path{newbook.*}`,
    name: '图书馆 - 新书速递',
    url: 'space.lib.buaa.edu.cn/mspace/newBook',
    maintainers: ['OverflowCat'],
    example: '/buaa/lib/space/newbook/',
    handler,
    description: `可通过参数进行筛选：\`/buaa/lib/space/newbook/key1=value1&key2=value2...\`
- \`dcpCode\`：学科分类代码
  - 例：
    - 工学：\`08\`
    - 工学 > 计算机 > 计算机科学与技术：\`080901\`
  - 默认值：\`nolimit\`
  - 注意事项：不可与 \`clsNo\` 同时使用。
- \`clsNo\`：中图分类号
  - 例：
    - 计算机科学：\`TP3\`
  - 默认值：无
  - 注意事项
    - 不可与 \`dcpCode\` 同时使用。
    - 此模式下获取不到上架日期。
- \`libCode\`：图书馆代码
  - 例：
    - 本馆：\`00000\`
  - 默认值：无
  - 注意事项：只有本馆一个可选值。
- \`locaCode\`：馆藏地代码
  - 例：
    - 五层西-中文新书借阅室(A-Z类)：\`02503\`
  - 默认值：无
  - 注意事项：必须与 \`libCode\` 同时使用。

示例：
- \`buaa/lib/space/newbook\` 为所有新书
- \`buaa/lib/space/newbook/clsNo=U&libCode=00000&locaCode=60001\` 为沙河教2图书馆所有中图分类号为 U（交通运输）的书籍
`,
    categories: ['university'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

async function handler(ctx: Context): Promise<Data> {
    const path = ctx.req.param('path');
    const i = path.indexOf('/');
    const params = i === -1 ? '' : path.slice(i + 1);
    const searchParams = new URLSearchParams(params);
    const dcpCode = searchParams.get('dcpCode'); // Filter by subject (discipline code)
    const clsNo = searchParams.get('clsNo'); // Filter by class (Chinese Library Classification)
    if (dcpCode && clsNo) {
        throw new Error('dcpCode and clsNo cannot be used at the same time');
    }
    searchParams.set('pageSize', '100'); // Max page size. Any larger value will be ignored
    searchParams.set('page', '1');
    !dcpCode && !clsNo && searchParams.set('dcpCode', 'nolimit'); // No classification filter
    const url = `https://space.lib.buaa.edu.cn/meta-local/opac/new/100/${clsNo ? 'byclass' : 'bysubject'}?${searchParams.toString()}`;
    const { data } = await got(url);
    const list = (data?.data?.dataList || []) as Book[];
    const item = await Promise.all(list.map(async (item: Book) => await getItem(item)));
    const res: Data = {
        title: '北航图书馆 - 新书速递',
        item,
        description: '北京航空航天大学图书馆新书速递',
        language: 'zh-CN',
        link: 'https://space.lib.buaa.edu.cn/space/newBook',
        author: '北京航空航天大学图书馆',
        allowEmpty: true,
        image: 'https://lib.buaa.edu.cn/apple-touch-icon.png',
    };
    return res;
}

async function getItem(item: Book): Promise<DataItem> {
    return (await cache.tryGet(item.isbn, async () => {
        const info = await getItemInfo(item.isbn);
        const holdings = JSON.parse(item.holdings) as Holding[];
        const link = `https://space.lib.buaa.edu.cn/space/searchDetailLocal/${item.bibId}`;
        const content = renderToString(
            <>
                {info?.imageUrl ? (
                    <aside>
                        <img src={info.imageUrl} alt="封面" />
                    </aside>
                ) : null}
                <h2>书籍信息</h2>
                <div>
                    <span class="call-no" style="font-family: JetBrainsMono, monospace; font-style: italic; font-weight: 700; color: #458f57;">
                        {item.callno?.at(0) || '无'}
                    </span>{' '}
                    / <span class="author">{item.author}</span> / <span class="publisher">{item.publisher}</span> / <span class="pub-year">{item.pub_year}</span>
                </div>
                <h3>简介</h3>
                <div itemprop="description">{info?.content}</div>
                <table>
                    <tbody>
                        <tr>
                            <th>ISBN</th>
                            <td itemprop="isbn">{item.isbn}</td>
                        </tr>
                        <tr>
                            <th>语言</th>
                            <td itemprop="language">{item.language}</td>
                        </tr>
                        <tr>
                            <th>类型</th>
                            <td itemprop="docType">{item.docTypeDesc}</td>
                        </tr>
                    </tbody>
                </table>
                {info?.authorInfo ? (
                    <>
                        <h3>作者简介</h3>
                        <div itemprop="authorInfo">{info.authorInfo}</div>
                    </>
                ) : null}
                <h2>馆藏信息</h2>
                {item.onSelfDate ? (
                    <>
                        <strong>上架时间</strong>：<date datetime={item.onSelfDate}>{item.onSelfDate}</date>
                    </>
                ) : null}
                <br />
                <h3>馆藏地点</h3>
                <table>
                    <tbody>
                        {holdings.map((holding) => (
                            <>
                                <tr>
                                    <th>所属馆藏地</th>
                                    <td>{holding.location}</td>
                                </tr>
                                <tr>
                                    <th>索书号</th>
                                    <td>{holding.callNo}</td>
                                </tr>
                                <tr>
                                    <th>条码号</th>
                                    <td>{holding.barCode}</td>
                                </tr>
                                <tr>
                                    <th>编号</th>
                                    <td>{holding.itemId}</td>
                                </tr>
                                <tr>
                                    <th>书刊状态</th>
                                    <td style={`color: ${holding.status === '可借' ? '#458f57' : '#d86d02'}`}>{holding.status}</td>
                                </tr>
                            </>
                        ))}
                    </tbody>
                </table>
                {info?.catalog ? (
                    <>
                        <h2>目录</h2>
                        <div itemprop="catalog">{raw(info.catalog)}</div>
                    </>
                ) : null}
            </>
        );
        return {
            language: item.language === 'eng' ? 'en' : 'zh-CN',
            title: item.title,
            pubDate: item.onSelfDate ? timezone(parseDate(item.onSelfDate), +8) : undefined,
            description: content,
            link,
        };
    })) as DataItem;
}

async function getItemInfo(isbn: string): Promise<Info | null> {
    const url = `https://space.lib.buaa.edu.cn/meta-local/opac/third_api/douban/${isbn}/info`;
    const response = await got(url);
    return JSON.parse(response.body).data;
}
