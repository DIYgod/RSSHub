import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/zj/ningbogzw-notice/:colId?',
    categories: ['government'],
    example: '/gov/zj/ningbogzw-notice/1229116730',
    parameters: {
        colId: '公告分类id、详细信息点击源网站http://gzw.ningbo.gov.cn/请求中寻找',
    },
    radar: [
        {
            source: ['gzw.ningbo.gov.cn/col/col1229116730/index.html'],
            target: '/zj/ningbogzw-notice/:colId?',
        },
    ],
    name: '宁波市国资委-公告',
    url: 'gzw.ningbo.gov.cn',
    maintainers: ['HaoyuLee'],
    description: `
| 公告类别         | colId |
| ------------ | -- |
| 首页-市属国企招聘信息-招聘公告     | 1229116730  |
    `,
    async handler(ctx) {
        const { colId = '1229116730' } = ctx.req.param();
        const url = `http://gzw.ningbo.gov.cn/col/col${colId}/index.html`;
        const { data: response } = await got(url);
        const noticeCate = load(response)('.List-topic .text-tag').text().trim();
        const reg = /<li><a href=".*" target="_blank">.*<\/li>/g;
        const item = response.match(reg).map((line) => {
            const $ = load(line);
            const title = $('a');
            return {
                title: `宁波市国资委-${noticeCate}:${title.text()}`,
                link: `http://gzw.ningbo.gov.cn${title.attr('href')}`,
                pubDate: parseDate($('p').text().replaceAll(/\[|]/g, '')),
                author: '宁波市国资委',
                description: title.text(),
            };
        });
        return {
            title: '宁波市国资委',
            link: url,
            item,
        };
    },
};
