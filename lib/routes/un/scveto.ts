import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/scveto',
    categories: ['government'],
    example: '/un/scveto',
    name: 'Security Council Vetoed a Resolution',
    maintainers: ['HenryQW'],
    handler,
};

async function handler() {
    const url = 'https://www.un.org/depts/dhl/resguide/scact_veto_table_en.htm';

    const response = await ofetch(url);

    const $ = load(response);
    const vetoCounts = new Map<string, number>();
    const items = $('.tablefont > tbody > tr')
        .slice(3, -1)
        .toArray()
        .map((item) => {
            const content = $(item);

            let date = content.find('td:nth-child(1)').text();
            if (date.includes('-')) {
                date = date.split('-', 2)[1];
            }

            const resolution = content.find('td:nth-child(2)');
            const meeting = content.find('td:nth-child(3)');
            const agenda = content.find('td:nth-child(4)');
            const country = content.find('td:nth-child(5)');
            country.find('br').replaceWith(' and ');
            const guid = `scveto:${resolution.text()}`;
            const vetoNumber = (vetoCounts.get(guid) ?? 0) + 1;
            vetoCounts.set(guid, vetoNumber);

            return {
                title: `${country.text()} vetoed a Resolution`,
                description: `${country.html()} vetoed ${agenda.html()}. <br/> <br/> <b>Resolution: </b> ${resolution.html()}<br/><br/>  <b>Meeting Record: </b> ${meeting.html()}`,
                link: resolution.find('a').attr('href'),
                guid: vetoNumber === 1 ? guid : `${guid}:${vetoNumber}`,
                pubDate: date ? timezone(parseDate(date), 0) : undefined,
            };
        });

    return {
        title: 'United Nations Security Council Vetoed Resolutions',
        link: 'http://research.un.org/en/docs/sc/quick/veto',
        description:
            'The United Nations Security Council "veto power" refers to the power of the permanent members of the UN Security Council (China, France, Russia, United Kingdom, and United States) to veto any "substantive" resolution. Aka, abuse of power.',
        item: items,
    };
}
