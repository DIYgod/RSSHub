import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/tjghhzrzy/jjzcwj',
    categories: ['government'],
    example: '/gov/tianjin/tjghhzrzy/jjzcwj',
    name: 'TJ 局级文件',
    url: 'ghhzrzy.tj.gov.cn/zwgk_143/zcwj/jjzcwj/',
    maintainers: ['frankhumbleble'],
    radar: [
        {
            source: ['ghhzrzy.tj.gov.cn/zwgk_143/zcwj/jjzcwj/'],
            target: '/tjghhzrzy/jjzcwj',
        },
    ],
    async handler(ctx) {
        const searchApi = 'https://ghhzrzy.tj.gov.cn/igs/front/search/list.html';
        const params = new URLSearchParams({
            pageNumber: '1',
            pageSize: '30',
            'filter[CHANNELID]': '64803',
            index: 'tjsghhzrglj',
            type: 'xzxkjgcx',
            orderProperty: 'ZXSJ',
            orderDirection: 'desc',
            'filter[AVAILABLE]': 'true',
        });

        const { data: response } = await got(`${searchApi}?${params}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                Accept: 'application/json, text/plain, */*',
                Referer: 'https://ghhzrzy.tj.gov.cn/zwgk_143/zcwj/jjzcwj/',
            },
        });

        const content = response?.page?.content ?? [];

        const items = content.map((item: Record<string, string>) => {
            const title = item.BT || '（无标题）';
            const link = item.DOCPUBURL || '';
            const pubDate = item.ZXSJ ? parseDate(item.ZXSJ) : undefined;
            const docDate = item.CWRQ ? item.CWRQ.substring(0, 10) : '';
            const fullText = item.ZW || '（暂无正文）';
            const valid = item.YXX === '0' ? '有效' : item.YXX === '1' ? '无效' : '';

            const description =
                `<p>${valid ? '【' + valid + '】' : ''}</p>` +
                `<p>成文日期：${docDate}</p>` +
                `<hr>` +
                fullText;

            return {
                title: `${valid ? '【' + valid + '】' : ''}${title}`,
                link,
                pubDate,
                description,
            };
        });

        return {
            title: 'TJ 局级文件',
            link: 'https://ghhzrzy.tj.gov.cn/zwgk_143/zcwj/jjzcwj/',
            item: items,
        };
    },
};
