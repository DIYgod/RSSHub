// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import * as path from 'node:path';
import { art } from '@/utils/render';

const renderDesc = (item) => art(path.join(__dirname, 'templates/zjxwlb.art'), item);

export default async (ctx) => {
    const url = 'http://www.cztv.com/videos/zjxwlb';

    const { data: res } = await got(url);
    const $ = load(res);
    const list = $('#videolistss li')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('span.t1').text();
            const link = item.find('input[name=data-url]').attr('value');
            const videoUrl = item.find('input[name=video]').attr('value');
            const posterUrl = item.find('input[name=videoimage]').attr('value');

            return {
                title,
                link,
                pubDate: timezone(parseDate(item.find('span.t2').text() + ' 16:30', 'YYYY-MM-DD hh:mm'), +8),
                description: renderDesc({ title, videoUrl, posterUrl }),
            };
        });

    ctx.set('data', {
        title: '浙江新闻联播',
        link: url,
        item: list,
    });
};
