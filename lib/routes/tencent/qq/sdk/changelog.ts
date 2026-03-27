import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';

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

    // 获取主要文本，并且过滤空行
    const contents = $('.wp-editor')
        .children('p')
        .filter((_, element) => $(element).text() !== '');

    const pList = [];
    const titleIndex = [];

    // 遍历文本 p 标签，并且获取标题索引
    contents.each((index, element) => {
        if ($(element).find('strong').length) {
            titleIndex.push(index);
        }

        pList.push($(element).text().replace('\n', ''));
    });

    // 用标题索引切割数组
    const changelogs = titleIndex.map((_, index) => {
        const section = pList.slice(titleIndex[index], titleIndex[index + 1]);
        const changelog = {
            title: section[0],
            description: section.slice(1).join('\n'),
        };

        return changelog;
    });

    return {
        title,
        link,
        item: changelogs,
    };
}
