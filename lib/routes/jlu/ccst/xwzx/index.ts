import { Route } from '@/types';
import got from '@/utils/got'; // Custom got instance
import { load } from 'cheerio'; // HTML parser with jQuery-like API

export const route: Route = {
    path: '/ccst/xwzx/:category',
    categories: ['university'],
    example: '/jlu/ccst/xwzx/gsl',
    radar: [
        {
            source: ['ccst.jlu.edu.cn/xwzx/gsl.htm', 'ccst.jlu.edu.cn/xwzx/xstd.htm', 'ccst.jlu.edu.cn/xwzx/xytz.htm', 'ccst.jlu.edu.cn/xwzx/xyxw.htm', 'ccst.jlu.edu.cn/xwzx/zsjy.htm'],
        },
    ],
    name: '吉林大学计算机科学与技术学院 - 新闻中心',
    maintainers: ['mayouxi'],
    handler,
    url: 'ccst.jlu.edu.cn',
};

async function handler(ctx: any) {
    const category = ctx.req.param('category');
    const baseUrl = 'https://ccst.jlu.edu.cn';
    const url = `${baseUrl}/xwzx/${category}.htm`;
    const response = await got(url);
    const $ = load(response.body);

    const list = $('.section.container .main .list3 ul li');

    const titles: { [key: string]: string } = {
        gsl: '公示栏',
        xstd: '学生天地',
        xytz: '学院通知',
        xyxw: '学院新闻',
        zsjy: '招生就业',
    };

    const titleSuffix = titles[category] || '新闻中心'; // Fallback to '新闻中心' if category is not found

    return {
        title: `吉林大学计算机科学与技术学院 - 新闻中心${titleSuffix}`,
        link: baseUrl,
        description: `吉林大学计算机科学与技术学院 - 新闻中心${titleSuffix}`,

        item: list.toArray().map((item) => {
            const el = $(item);

            const linkEl = el.find('a');
            const dateEl = el.find('.date');
            const dateStr = dateEl.text().trim();
            const title = linkEl.text().trim();
            const rawLink = linkEl.attr('href')!.replaceAll('..', ''); // Replace all occurrences of '..'
            const link = `${baseUrl}${encodeURI(rawLink)}`; // Encode the URL properly

            const newsDate = new Date(dateStr);

            return {
                title,
                link,
                pubDate: newsDate,
            };
        }),
    };
}
