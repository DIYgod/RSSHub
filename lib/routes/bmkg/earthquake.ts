import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const url = 'https://www.bmkg.go.id/gempabumi-terkini.html';
    const response = await got(url);
    const $ = load(response.data);
    const items = $('div .table-responsive tbody tr')
        .toArray()
        .map((item) => {
            item = $(item);
            const td = item.find('td');
            return {
                title: `${td[2].children[0].data}|${td[3].children[0].data}|${td[4].children[0].data}|${td[5].children[0].data}|${td[6].children[0].data}`,
                link: url,
                pubDate: timezone(parseDate(`${td[1].children[0].data} ${td[1].children[2].data.slice(0, 8)}`, 'DD-MM-YY HH:mm:ss'), +7),
            };
        });

    ctx.set('data', {
        title: $('title').text(),
        link: url,
        description: '印尼气象气候和地球物理局 最近的地震(M ≥ 5.0) | BMKG earthquake',
        item: items,
        language: 'in',
    });
};
