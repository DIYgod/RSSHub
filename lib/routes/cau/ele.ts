// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'https://ciee.cau.edu.cn';
    const link = `${baseUrl}/col/col26712/index.html`;
    const response = await got(`${baseUrl}/module/web/jpage/dataproxy.jsp`, {
        searchParams: {
            page: 1,
            appid: 1,
            webid: 107,
            path: '/',
            columnid: 26712,
            unitid: 38467,
            webname: '信息与电气工程学院',
            permissiontype: 0,
        },
    });
    const $ = load(response.data);
    const list = $('recordset record');

    ctx.set('data', {
        title: '中国农业大学信电学院',
        link,
        description: '中国农业大学信电学院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                const title = a.attr('title');
                const link = `${baseUrl}${a.attr('href')}`;
                return {
                    title,
                    link,
                    pubDate: parseDate(item.find('.col-lg-1').text()),
                    guid: `${link}#${title}`,
                };
            }),
    });
};
