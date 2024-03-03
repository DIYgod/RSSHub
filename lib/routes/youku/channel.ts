// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const channelId = ctx.req.param('channelId');
    const embed = !ctx.req.param('embed');

    const response = await got({
        method: 'get',
        url: `https://i.youku.com/i/${channelId}/videos`,
        headers: {
            Host: 'i.youku.com',
            Referer: `https://i.youku.com/i/${channelId}`,
        },
    });

    const data = response.data;
    const $ = load(data);
    const list = $('div.videoitem_pack');

    ctx.set('data', {
        title: $('.username').text(),
        link: `https://i.youku.com/i/${channelId}`,
        description: $('.desc').text(),
        item:
            list &&
            list
                .map((_, item) => {
                    item = $(item);
                    const title = item.find('a.videoitem_videolink').attr('title');
                    const cover = item.find('a.videoitem_videolink > img').attr('src');
                    const $link = item.find('a.videoitem_videolink');
                    const link = $link.length > 0 ? `https:${$link.attr('href')}` : null;
                    const dateText = item.find('p.videoitem_subtitle').text().split('-').length === 2 ? `${new Date().getFullYear()}-${item.find('p.videoitem_subtitle').text()}` : item.find('p.videoitem_subtitle').text();
                    const pubDate = parseDate(dateText);

                    return link
                        ? {
                              title,
                              description: art(path.join(__dirname, 'templates/channel.art'), {
                                  embed,
                                  videoId: path.parse(link).name.replaceAll(/^id_/g, ''),
                                  cover,
                              }),
                              link,
                              pubDate,
                          }
                        : null;
                })
                .get()
                .filter(Boolean),
    });
};
