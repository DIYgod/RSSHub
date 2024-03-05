// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '';
    const sort = ctx.req.param('sort') ?? '';
    const day = ctx.req.param('day') ?? '';

    const rootUrl = 'https://www.jisilu.cn';
    let currentUrl = '',
        name = '',
        response;

    if (category === 'reply' || category === 'topic') {
        if (sort) {
            currentUrl = `${rootUrl}/people/${sort}`;
            response = await got({
                method: 'get',
                url: currentUrl,
            });
            name = response.data.match(/<title>(.*) 的个人主页 - 集思录<\/title>/)[1];
            response = await got({
                method: 'get',
                url: `${rootUrl}/people/ajax/user_actions/uid-${response.data.match(/var PEOPLE_USER_ID = '(.*)'/)[1]}__actions-${category === 'topic' ? 1 : 2}01__page-0`,
            });
        } else {
            throw new Error('No user.');
        }
    } else {
        currentUrl = `${rootUrl}/home/explore/category-${category}__sort_type-${sort}__day-${day}`;
        response = await got({
            method: 'get',
            url: currentUrl,
        });
    }

    const $ = load(response.data);

    $('.nav').prevAll('.aw-item').remove();

    let items = $('.aw-item')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('h4 a');

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: timezone(
                    parseDate(
                        item
                            .find('.aw-text-color-999')
                            .text()
                            .match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)[1]
                    ),
                    +8
                ),
                author: category === 'reply' || category === 'topic' ? name : decodeURI(item.find('.aw-user-name').first().attr('href').split('/people/').pop()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.aw-dynamic-topic-more-operate').remove();

                item.description = content('.aw-question-detail-txt').html() + content('.aw-dynamic-topic-content').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${name ? `${name}的${category === 'topic' ? '主题' : '回复'}` : '广场'} - 集思录`,
        link: currentUrl,
        item: items,
    });
};
