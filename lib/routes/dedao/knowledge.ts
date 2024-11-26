import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/knowledge/:topic?/:type?',
    categories: ['new-media', 'popular'],
    example: '/dedao/knowledge',
    parameters: { topic: '话题 id，可在对应话题页 URL 中找到', type: '分享类型，`true` 指精选，`false` 指最新，默认为精选' },
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
            source: ['dedao.cn/knowledge/topic/:topic', 'dedao.cn/knowledge', 'dedao.cn/'],
        },
    ],
    name: '知识城邦',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const topic = ctx.req.param('topic') ?? '';
    const type = /t|y/i.test(ctx.req.param('type') ?? 'true');
    const count = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100;

    const rootUrl = 'https://www.dedao.cn';
    const currentUrl = `${rootUrl}/knowledge${topic === '' ? '' : '/topic/' + topic}`;
    const apiUrl = `${rootUrl}/pc/ledgers/${topic === '' ? 'notes/friends_timeline' : 'topic/notes/list'}`;
    const detailUrl = `${rootUrl}/pc/ledgers/topic/detail`;

    let title = '',
        description = '';

    if (topic !== '') {
        const detailResponse = await got({
            method: 'post',
            url: detailUrl,
            json: {
                incr_view_count: false,
                topic_id_hazy: topic,
            },
        });

        title = detailResponse.data.c.name;
        description = detailResponse.data.c.intro;
    }

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: {
            count,
            load_chain: true,
            is_elected: type,
            page_id: 0,
            topic_id_hazy: topic,
            version: 2,
        },
    });

    const items = (topic === '' ? response.data.c.notes : response.data.c.note_detail_list).map((item) => ({
        title: item.f_part.note,
        author: item.f_part.nick_name,
        link: `${rootUrl}/knowledge/note/${item.f_part.note_id_hazy}`,
        pubDate: parseDate(item.f_part.time_desc, 'MM-DD'),
        description: art(path.join(__dirname, 'templates/knowledge.art'), {
            rootUrl,
            f_part: item.f_part,
            s_part: item.s_part,
        }),
    }));

    return {
        title: `得到 - 知识城邦${title === '' ? '' : ' - ' + title}`,
        link: currentUrl,
        item: items,
        description,
    };
}
