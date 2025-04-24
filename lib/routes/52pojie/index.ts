import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import iconv from 'iconv-lite';

export const route: Route = {
    path: '/jinpin',
    categories: ['bbs'],
    example: '/52pojie/jinpin',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.52pojie.cn'],
        },
    ],
    name: '52pojie精品软件区最新发贴',
    maintainers: ['asqwe1'],
    handler: async () => {
        const response = await ofetch(`https://www.52pojie.cn/forum.php?mod=forumdisplay&fid=16&filter=author&orderby=dateline`, {
        responseType: 'arrayBuffer', // 获取原始二进制数据
        });
        const decodedHtml = iconv.decode(Buffer.from(response), 'gbk'); // 手动解码 GBK
        const $ = load(decodedHtml); // 加载解码后的 HTML
        const items = $('tbody[id^="normalthread"] > tr > th')
            // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
            .toArray()
            // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
            .map((item) => {
                item = $(item);
                const a = item.find('a.s.xst').first();
                return {
                    title: a.text(),
                    link: `https://www.52pojie.cn/${a.attr('href')}`,
                };
            });
        // 在此处编写路由处理函数
        return {
            // 源标题
            title: `52pojie精品软件区最新发贴`,
            // 源链接
            link: `https://www.52pojie.cn/forum.php?mod=forumdisplay&fid=16&filter=author&orderby=dateline`,
            // 源文章
            item: items,
        };
    },
};