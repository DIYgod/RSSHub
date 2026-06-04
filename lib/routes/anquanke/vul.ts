import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const handler = async () => {
    const url = 'https://www.anquanke.com';

    const response = await got(`${url}/vul`);
    const $ = load(response.data);
    const list = $('table>tbody>tr').toArray();

    const items = list.map((i) => {
        const item = $(i);

        const title = item.find('td:first-child a').text();
        const cve = item.find('td:nth-child(2)').text();
        const pla = item.find('.vul-type-item').text().replaceAll(/\s+/g, '');
        const date = parseDate(item.find('td:nth-last-child(2)').text().replaceAll(/\s+/g, ''));
        const href = item.find('a').attr('href');

        return {
            title: `${title}【${cve}】${pla === '未知' ? '' : pla}`,
            description: `编号:${cve} | 平台:${pla}`,
            pubDate: date,
            link: `${url}${href}`,
        };
    });

    return {
        title: '安全客-漏洞cve报告',
        link: 'https://www.anquanke.com/vul',
        item: items,
    };
};

export default handler;
