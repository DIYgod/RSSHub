import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/digest/:tid',
    categories: ['bbs'],
    example: '/saraba1st/digest/forum-75-1',
    parameters: { tid: '论坛 id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '论坛摘要',
    maintainers: ['shinemoon'],
    handler,
    description: `版面网址如果为 \`https://bbs.saraba1st.com/2b/forum-75-1.html\` 那么论坛 id 就是 \`forum-75-1\`。`,
};

async function handler(ctx) {
    const tid = ctx.req.param('tid');
    const cookieString = config.saraba1st.cookie ?? '';
    const res = await got('https://bbs.saraba1st.com/2b/' + tid + '.html', {
        headers: {
            Cookie: cookieString,
        },
    });
    const $ = load(res.data);
    const title = $('head title').text().replace(/-.*/, '');
    const list = $('#threadlisttableid tbody[id^="normalthread_"] tr');
    const count = list
        .slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20)
        .toArray()
        .map((each) => {
            each = $(each);
            const floor = each.find('th.new a.s.xst').text();
            const floorUrl = each.find('th.new a.s.xst').attr('href');
            return {
                title: `${title}:${floor}`,
                link: new URL(floorUrl, 'https://bbs.saraba1st.com/2b/').href,
                author: each.find('td.by cite').text(),
                pubDate: timezone(parseDate(each.find('td.by em').first().text()), +8),
            };
        });

    const resultItems = await Promise.all(
        count.map((i) =>
            cache.tryGet(i.link, async () => {
                i.description = await fetchContent(i.link);
                return i;
            })
        )
    );

    return {
        title: `Stage1 论坛 - ${title}`,
        link: `https://bbs.saraba1st.com/2b/${tid}.html`,
        //        item: await resultItems,
        item: resultItems,
    };
}

async function fetchContent(url) {
    // Fetch the subpageinof
    const cookieString = config.saraba1st.cookie ?? '';
    const subres = await got(url, {
        headers: {
            Cookie: cookieString,
        },
    });
    const subind = load(subres.data);
    const stubS = subind('<div>');
    subind('#postlist')
        .find('div[id*="post_"] ')
        .each(function () {
            if (subind(this).find('td[id*="postmessage_"]').length > 0) {
                const section = art(path.join(__dirname, 'templates/digest.art'), {
                    author: {
                        link: subind(this).find('.pls.favatar div.authi a').attr('href'),
                        name: subind(this).find('.pls.favatar div.authi').text(),
                        postinfo: subind(this).find('div.authi em[id*=authorposton]').text(),
                    },
                    msg: subind(this).find('td[id*="postmessage_"]').html(),
                });
                stubS.append(section);
            }
        });

    stubS.find('img').each(function () {
        const img = subind(this);
        const file = img.attr('file');
        if (file) {
            img.attr('src', file);
            img.removeAttr('zoomfile');
            img.removeAttr('file');
            img.removeAttr('onmouseover');
            img.removeAttr('onclick');
        }
    });

    return stubS.html();
}
