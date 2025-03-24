import { Route } from '@/types';
import type { Context } from 'hono';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const handler = async (ctx: Context) => {
    const { catId = '1' } = ctx.req.param();
    const url = `https://www.chiphell.com/portal.php?mod=list&catid=${catId}`;

    const response = await ofetch(url);
    const $ = cheerio.load(response);

    const list = $('dl.cl')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a.xi2');

            return {
                title: a.text(),
                link: `https://www.chiphell.com/${a.attr('href')}`,
                category: [$item.find('dd label').text()],
                pubDate: timezone(parseDate($item.find('span.xg1').text()), +8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = cheerio.load(response);

                $('#article_content div br').parent().remove();
                let description = $('#article_content').html();

                if ($('.pg').length) {
                    const urls = $('.pg a')
                        .toArray()
                        .map((item) => {
                            const $item = $(item);
                            return `https://www.chiphell.com/${$item.attr('href')}`;
                        })
                        .slice(0, -1);
                    const responses = await Promise.all(urls.map((url) => ofetch(url)));
                    const $pages = responses.map((item) => cheerio.load(item));
                    const contents = $pages.map(($item) => {
                        $item('#article_content div br').parent().remove();
                        return $item('#article_content').html();
                    });
                    description = [description, ...contents].join('');
                }

                item.description = description;

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: url,
        item: items,
    };
};

export const route: Route = {
    path: '/portal/:catId?',
    name: '分类',
    categories: ['bbs'],
    example: '/chiphell/portal/1',
    parameters: {
        catId: '分类 ID，可在 URL 中找到，默认为 1',
    },
    maintainers: ['tylinux'],
    handler,
};
