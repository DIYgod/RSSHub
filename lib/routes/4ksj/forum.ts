import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import iconv from 'iconv-lite';

export const route: Route = {
    path: '/:id?',
    name: '分类',
    url: '4ksj.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/4ksj/4k-uhd-1',
    parameters: { id: '分类 id，默认为最新4K电影' },
    description: `:::tip
  若订阅 [最新 4K 电影](https://www.4ksj.com/4k-uhd-1.html)，网址为 \`https://www.4ksj.com/4k-uhd-1.html\`。截取 \`https://www.4ksj.com/\` 到末尾 \`.html\` 的部分 \`4k-uhd-1\` 作为参数，此时路由为 [\`/4ksj/4k-uhd-1\`](https://rsshub.app/4ksj/4k-uhd-1)。

  若订阅子分类 [Dolby Vision 动作 4K 电影](https://www.4ksj.com/4k-uhd-s7-display-3-dytypes-1-1.html)，网址为 \`https://www.4ksj.com/4k-uhd-s7-display-3-dytypes-1-1.html\`。截取 \`https://www.4ksj.com/forum-\` 到末尾 \`.html\` 的部分 \`4kdianying-s7-dianyingbiaozhun-3-dytypes-9-1\` 作为参数，此时路由为 [\`/4ksj/4k-uhd-s7-display-3-dytypes-1-1\`](https://rsshub.app/4ksj/4k-uhd-s7-display-3-dytypes-1-1)。
  :::`,
    categories: ['multimedia'],
};

async function handler(ctx) {
    const { id = '4k-uhd-1' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;

    const rootUrl = 'https://www.4ksj.com';
    const currentUrl = new URL(`${id}.html`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response, 'gbk'));

    const language = 'zh';
    const image = $('div.nexlogo img').prop('src');

    let items = $('div.nex_cmo_piv a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: new URL(item.prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link, {
                    responseType: 'buffer',
                });

                const $$ = load(iconv.decode(detailResponse, 'gbk'));

                $$('div.nex_drama_intros em').first().remove();
                $$('strong font').each((_, el) => {
                    el = $$(el);

                    el.parent().remove();
                });

                const title = $$('div.nex_drama_Top h5').text();
                const description = $$('div.nex_drama_intros').html();
                const picture =
                    $$('div.nex_drama_pic')
                        .html()
                        .match(/background:url\((.*?)\)/)?.[1] ?? '';

                const details = $$('li.nex_drama_Detail_li, li.nex_drama_Detail_lis dd')
                    .toArray()
                    .map((li) => {
                        li = $$(li);

                        const key = li.find('em').text().replaceAll(/：|\s/g, '');
                        const value = li.find('span').length === 0 ? li.contents().last().text().trim() : li.find('span').text().trim();

                        return { [key]: value };
                    })
                    .reduce(
                        (obj, item) => ({
                            ...obj,
                            ...item,
                        }),
                        {}
                    );

                const links =
                    $$('td.t_f ignore_js_op').length === 0
                        ? $$('td.t_f strong')
                              .toArray()
                              .map((l) => {
                                  l = $$(l);

                                  const title = l.contents().first().text();
                                  const link = l.next().prop('href') ?? l.nextUntil('a').next().prop('href');

                                  item.enclosure_url = item.enclosure_url ?? link;
                                  item.enclosure_type = item.enclosure_type ?? 'application/x-bittorrent';
                                  item.enclosure_title = item.enclosure_title ?? title;

                                  return {
                                      title,
                                      tags: l
                                          .contents()
                                          .last()
                                          .text()
                                          .match(/【(.*?)】/g),
                                      link,
                                  };
                              })
                        : $$('div.newfujian')
                              .toArray()
                              .map((l) => {
                                  l = $$(l);

                                  return {
                                      title: l.find('p.filename').prop('title') || l.find('p.filename').text(),
                                      tags: l
                                          .find('div.fileaq')
                                          .text()
                                          .match(/【(.*?)】/g),
                                      link: l.find('div.down_2 a').prop('href'),
                                  };
                              });

                const pubDateEl = $$('table.boxtable em').first();
                const pubDate =
                    pubDateEl.find('span[title]').length === 0
                        ? pubDateEl
                              .first()
                              .text()
                              .replace(/发表于\s/, '')
                        : pubDateEl.find('span[title]').prop('title');

                item.title = title;
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    images: picture
                        ? [
                              {
                                  src: picture,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    title,
                    keys: Object.keys(details),
                    details,
                    description,
                    info: $$('div.nex_drama_sums').html(),
                    links,
                });
                item.pubDate = timezone(parseDate(pubDate, 'YYYY-M-D HH:mm:ss'), +8);
                item.category = Object.values(details)
                    .flatMap((c) => c.split(/\s/))
                    .filter(Boolean);
                item.author = details['导演'];
                item.content = {
                    html: description,
                    text: $$('div.nex_drama_intros').text(),
                };
                item.image = picture;
                item.banner = picture;
                item.language = language;

                return item;
            })
        )
    );

    return {
        title: `4k世界 - ${
            $('#fontsearch ul.cl li.a')
                .toArray()
                .map((a) => $(a).text())
                .join('+') || '不限'
        }`,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[name="application-name"]').prop('content'),
        language,
    };
}
