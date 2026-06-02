import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import { bbcodeToHtml } from '../utils';

const baseUrl = 'https://bgm.tv';
const apiUrl = 'https://next.bgm.tv/p1';

export const route: Route = {
    path: '/group/:id',
    categories: ['anime'],
    example: '/bangumi.tv/group/boring',
    parameters: { id: '小组 id, 在小组页面地址栏查看' },
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
            source: ['bgm.tv/group/:id'],
        },
    ],
    name: '小组话题',
    maintainers: ['SettingDust'],
    handler,
};

async function fetchGroupTopicList(groupId: string, limit = 20, offset = 0) {
    const url = `${apiUrl}/groups/${groupId}/topics?limit=${limit}&offset=${offset}`;
    const response = await ofetch(url, {
        method: 'get',
        headers: {
            Accept: 'application/json',
            'User-Agent': config.trueUA,
        },
    });
    return response.data;
}

async function fetchGroupTopicDetail(topicId: string) {
    const url = `${apiUrl}/topics/${topicId}`;
    const response = await ofetch(url, {
        method: 'get',
        headers: {
            Accept: 'application/json',
            'User-Agent': config.trueUA,
        },
    });
    return response.data;
}

async function handler(ctx) {
    const groupID = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Math.min(Number.parseInt(ctx.req.query('limit'), 10) || 20, 20) : 20;
    const offset = 0;

    // 获取小组话题列表
    const topicListData = await fetchGroupTopicList(groupID, limit, offset);
    if (!topicListData.data || topicListData.data.length === 0) {
        return {
            title: `小组 ${groupID} 的话题`,
            link: `${baseUrl}/group/${groupID}`,
            item: [],
        };
    }
    
    // 并行获取话题详情
    const detailPromises = topicListData.data.map((topic) => fetchGroupTopicDetail(topic.id));
    const topics = await Promise.all(detailPromises);

    // 获取小组名称
    const groupName = topics[0]?.group?.name || groupID;

    const items = topics.map((item) => ({
        title: item.title,
        link: `${baseUrl}/group/topic/${item.id}`,
        description: bbcodeToHtml(item.replies[0].content),
        // API 内的 createdAt 是秒级 Unix 时间戳，乘 1000 转为毫秒
        pubDate: parseDate(item.createdAt * 1000),
        author: item.author?.username || '',
        categories: (item.tags ?? []).map((tag) => tag.name),
    }));

    return {
        title: `${groupName} 的话题`,
        link: `${baseUrl}/group/${groupID}`,
        item: items,
    };
}
