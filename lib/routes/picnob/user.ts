import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseRelativeDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';

export const route: Route = {
    path: '/user/:id/:type?',
    categories: ['social-media'],
    example: '/picnob/user/xlisa_olivex',
    parameters: {
        id: 'Instagram id',
        type: 'Type of profile page (profile or tagged)',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.picnob.com/profile/:id'],
            target: '/user/:id',
        },
        {
            source: ['www.picnob.com/profile/:id/tagged'],
            target: '/user/:id/tagged',
        },
    ],
    name: 'User Profile - Picnob',
    maintainers: ['TonyRL', 'micheal-death', 'AiraNadih', 'DIYgod', 'hyoban', 'Rongronggg9'],
    handler,
    view: ViewType.Pictures,
};

async function handler(ctx) {
    const baseUrl = 'https://www.picnob.com';
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') ?? 'profile';
    const profileUrl = `${baseUrl}/profile/${id}/${type === 'tagged' ? 'tagged/' : ''}`;

    const context = await playwright();

    const page = await context.newPage();
    await page.route('**/*', (route) => {
        const request = route.request();
        request.resourceType() === 'document' ? route.continue() : route.abort();
    });

    await page.goto(profileUrl, {
        waitUntil: 'domcontentloaded',
    });
    logger.http(`Requesting ${profileUrl}`);
    const html = await page.content();
    const $ = load(html);

    const list = $('.post_box')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const coverLink = $item.find('.cover_link').attr('href');
            const image = $item.find('.cover .cover_link img');
            const alt = image.attr('alt') || '';
            const sum = $item.find('.sum');
            const title = sum.text().split('\n')[0] || alt;
            const content = sum.html()?.replaceAll('\n', '<br>') || alt;

            return {
                title,
                description: `<img src="${image.attr('data-src')}"><br>${content}`,
                link: `${baseUrl}${coverLink}`,
                guid: coverLink?.split('/')?.[2],
                pubDate: parseRelativeDate($item.find('.time .txt').text()),
                slideOrVideo: $item.find('.corner').length,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                let media = '';

                if (item.slideOrVideo) {
                    const page = await context.newPage();
                    await page.route('**/*', (route) => {
                        const request = route.request();
                        request.resourceType() === 'document' ? route.continue() : route.abort();
                    });

                    await page.goto(item.link, {
                        waitUntil: 'domcontentloaded',
                    });
                    logger.http(`Requesting ${item.link}`);
                    const html = await page.content();
                    const $ = load(html);

                    media = $('.slide-item').length
                        ? $('.slide-item div:first-of-type')
                              .toArray()
                              .map((item) => {
                                  const $item = $(item);
                                  if ($item.hasClass('video')) {
                                      return $item.find('video').prop('outerHTML');
                                  } else {
                                      // $item.hasClass('pic')
                                      $item.find('img').attr('src', $item.find('img').attr('data-src'));
                                      $item.find('img').removeAttr('data-src');
                                      return $item.html() || '';
                                  }
                              })
                              .join('')
                        : $('.view .video').html() || '';

                    item.description = `${media}<br>${item.description}`;
                }

                return item;
            })
        )
    );

    await context.close();

    return {
        title: `${$('h1.fullname').text()} (@${id}) ${type === 'tagged' ? 'tagged' : 'public'} posts - Picnob`,
        description: $('.info .sum').text(),
        link: profileUrl,
        image: $('.ava .pic img').attr('src'),
        item: items,
    };
}
