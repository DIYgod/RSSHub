import { Data, DataItem, Route } from '@/types';
import { Context } from 'hono';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import cache from '@/utils/cache';
import { art } from '@/utils/render';
import path from 'path';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

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
        const content = art(path.join(__dirname, 'templates/newbook.art'), {
            item,
            info,
            holdings,
        });
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
