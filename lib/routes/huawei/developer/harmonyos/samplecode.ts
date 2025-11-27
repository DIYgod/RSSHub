import MarkdownIt from 'markdown-it';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt({
    html: true,
});

export const route: Route = {
    path: '/developer/harmonyos/sample-code',
    categories: ['programming'],
    example: '/huawei/developer/harmonyos/sample-code',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['developer.huawei.com/consumer/cn/samples'],
            target: '/huawei/developer/harmonyos/sample-code',
        },
    ],
    name: 'HarmonyOS 示例代码',
    maintainers: ['JiZhi-Error'],
    handler,
};

async function handler() {
    const response = await ofetch('https://svc-drcn.developer.huawei.com/community/servlet/consumer/partnerCommunityService/v1/servlet/samplecode/getSampleCodes', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            origin: 'https://developer.huawei.com',
            referer: 'https://developer.huawei.com/',
        },
        body: JSON.stringify({
            classifyId: '',
            classifyIdList: [],
            keywords: '',
            language: 'zh',
            pageIndex: 1,
            pageSize: 100,
        }),
    });

    const items = response.resultList.map((item) => ({
        title: md.renderInline(item.name),
        link: item.link,
        description: md.render(item.description),
        category: item.keywords,
        pubDate: parseDate(item.updateTime),
        author: 'HarmonyOS',
        id: item.id,
        image: item.effectPictureUrl,
    }));

    return {
        title: 'HarmonyOS 示例代码 - 华为开发者联盟',
        link: 'https://developer.huawei.com/consumer/cn/samples/',
        description: '华为鸿蒙系统示例代码更新',
        language: 'zh-CN',
        item: items,
    };
}
