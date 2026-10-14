import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const restoreReleaseSiblings = ($: CheerioAPI) => {
    // Unclosed list items on the source page can contain later release headings.
    $('.wp-editor li').each((_, element) => {
        const $item = $(element);
        const nodes = $item.contents().toArray();
        const releaseStart = nodes.findIndex((node) => node.type === 'tag' && node.name === 'p' && /^V\d/.test($(node).find('strong').text()));
        if (releaseStart === -1) {
            return;
        }
        const leadingItem = clearContent(copyContent($item, $)).append(nodes.slice(0, releaseStart));
        $item.replaceWith(
            leadingItem.toString() +
                nodes
                    .slice(releaseStart)
                    .map((node) => $.html(node))
                    .join('')
        );
    });
};
export const route: Route = {
    path: '/qq/sdk/changelog/:platform',
    categories: ['program-update'],
    example: '/tencent/qq/sdk/changelog/iOS',
    parameters: { platform: '平台，iOS / Android' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '更新日志',
    maintainers: ['nuomi1'],
    handler,
};
async function handler(ctx) {
    const platform = ctx.req.param('platform');
    let title: string;
    let link: string;
    if (platform === 'iOS') {
        title = 'iOS SDK 历史变更';
        link = 'https://wiki.connect.qq.com/ios_sdk历史变更';
    } else if (platform === 'Android') {
        title = 'Android SDK 历史变更';
        link = 'https://wiki.connect.qq.com/android_sdk历史变更';
    } else {
        throw new InvalidParameterError('not support platform');
    }
    const response = await got.get(link);
    const $ = load(response.data);
    restoreReleaseSiblings($);
    const publishedDates = new Map<string, string>();
    $('.wp-editor table tr').each((_, element) => {
        const $row = $(element);
        const date = $row.find('td').first().text();
        const anchor = $row.find('a[href^="#"]').attr('href')?.slice(1);
        if (!(anchor && /^\d{4}\.\d{2}\.\d{2}$/.test(date))) {
            return;
        }
        publishedDates.set(anchor, date.replaceAll('.', '-'));
    });
    const headings = $('.wp-editor')
        .children('p')
        .filter((_, element) => $(element).text() !== '' && $(element).find('strong').length > 0);
    const changelogs = headings.toArray().map((heading) => {
        const $heading = $(heading);
        const sectionTitle = $heading.text();
        const anchor = $heading.find('a[name]').attr('name');
        const publishedAt = anchor ? publishedDates.get(anchor) : undefined;
        return {
            title: sectionTitle,
            link: anchor ? `${link}#${anchor}` : link,
            guid: `${platform}:${sectionTitle}`,
            pubDate: publishedAt ? parseDateInTimezone(publishedAt, 8) : undefined,
            description: $heading
                .nextUntil('p:has(strong)')
                .toArray()
                .map((element) => $.html(element))
                .join(''),
        };
    });
    return {
        title,
        link,
        item: changelogs,
    };
}
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
function clearContent<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    selection.contents().remove();
    return selection;
}
