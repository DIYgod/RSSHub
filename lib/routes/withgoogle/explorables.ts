import { type Cheerio, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const parsePublicationDate = (value: string) => {
    if (!value) {
        return;
    }
    const date = parseDate(value, 'MMMM YYYY');
    return Number.isFinite(date.getTime()) ? date : undefined;
};
export const route: Route = {
    name: 'PAIR - AI Explorables',
    url: 'pair.withgoogle.com/explorables',
    path: '/explorables',
    maintainers: ['cesaryuan'],
    example: '/withgoogle/explorables',
    categories: ['blog'],
    radar: [
        {
            source: ['pair.withgoogle.com/explorables'],
            target: '',
        },
    ],
    handler: async () => {
        const baseUrl = 'https://pair.withgoogle.com';
        const response = await ofetch(baseUrl + '/explorables', {
            method: 'GET',
        });
        const $ = load(response);
        const list = $('div.explorable-card').toArray();
        const items = await unwrapFirstFailure(
            pMap(
                list,
                async (el) => {
                    const title = $(el).find('h3').text();
                    const image = $(el).find('img').attr('src');
                    const link = baseUrl + $(el).find('a').attr('href');
                    const detail = await cache.tryGet(`withgoogle:detail:v3:${link}`, async (): Promise<Pick<DataItem, 'description' | 'author' | 'pubDate'>> => {
                        const response = await ofetch(link);
                        const $item = load(response);
                        const author = mapElements($item('.byline .authors b'), (_, author) => $item(author).text().trim()).join(', ');
                        const pubDate = parsePublicationDate($item('.byline .date').text().trim());
                        $item('.header, h1.headline, .byline, #recirc, .recirc-feedback-form, script, style, link').remove();
                        $item('h3')
                            .filter((_, heading) => $item(heading).text().trim() === 'More Explorables')
                            .remove();
                        let description = $item('body').html();
                        if (!description || description.trim() === '') {
                            description = $(el).find('p').text();
                        }
                        return {
                            description,
                            author: author || undefined,
                            pubDate,
                        };
                    });
                    return { title, link, image, ...detail };
                },
                { concurrency: 3, stopOnError: false }
            )
        );
        return {
            title: 'PAIR - AI Explorables',
            link: 'https://pair.withgoogle.com/explorables',
            item: items,
        };
    },
};
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}
function mapElements<T, U>(selection: Cheerio<T>, mapper: (index: number, node: T) => U | U[] | null | undefined): U[] {
    return selection.toArray().flatMap((node, index) => mapper(index, node) ?? []);
}
