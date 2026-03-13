import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// 合并不同 subjectType 的 type 映射
const getTypeNames = (subjectType) => {
    const commonTypeNames = {
        1: '想看',
        2: '看过',
        3: '在看',
        4: '搁置',
        5: '抛弃',
    };

    switch (subjectType) {
        case '1': // 书籍
            return {
                1: '想读',
                2: '读过',
                3: '在读',
                4: '搁置',
                5: '抛弃',
            };
        case '2': // 动画
        case '6': // 三次元
            return commonTypeNames;
        case '3': // 音乐
            return {
                1: '想听',
                2: '听过',
                3: '在听',
                4: '搁置',
                5: '抛弃',
            };
        case '4': // 游戏
            return {
                1: '想玩',
                2: '玩过',
                3: '在玩',
                4: '搁置',
                5: '抛弃',
            };
        default:
            return commonTypeNames; // 默认使用通用的类型
    }
};

const renderSubjectDescription = (data) =>
    renderToString(
        <>
            {data.routeSubjectType === 'all' && (
                <>
                    类型：{data.subjectTypeName} <br />
                </>
            )}
            {data.subjectType === 2 && (
                <>
                    看到：{data.epStatus} / {data.subjectEps || '???'}
                    <br />
                </>
            )}
            {data.subjectType === 1 && (
                <>
                    读到：{data.epStatus} / {data.subjectEps || '???'}
                    <br />
                </>
            )}
            评分：{data.score}
            <br />
            放送时间：{data.date || '未知'}
            <br />
            <img src={data.picUrl} />
        </>
    );

export const route: Route = {
    path: '/user/collections/:id/:subjectType/:type',
    categories: ['anime'],
    example: '/bangumi.tv/user/collections/sai/1/1',
    parameters: {
        id: '用户 id, 在用户页面地址栏查看',
        subjectType: {
            description: '全部类别: `空`、book: `1`、anime: `2`、music: `3`、game: `4`、real: `6`',
            options: [
                { value: 'ALL', label: 'all' },
                { value: 'book', label: '1' },
                { value: 'anime', label: '2' },
                { value: 'music', label: '3' },
                { value: 'game', label: '4' },
                { value: 'real', label: '6' },
            ],
        },
        type: {
            description: '全部类别: `空`、想看: `1`、看过: `2`、在看: `3`、搁置: `4`、抛弃: `5`',
            options: [
                { value: 'ALL', label: 'all' },
                { value: '想看', label: '1' },
                { value: '看过', label: '2' },
                { value: '在看', label: '3' },
                { value: '搁置', label: '4' },
                { value: '抛弃', label: '5' },
            ],
        },
    },
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
            source: ['bgm.tv/anime/list/:id'],
            target: '/bangumi.tv/user/collections/:id/all/all',
        },
        {
            source: ['bangumi.tv/anime/list/:id'],
            target: '/bangumi.tv/user/collections/:id/all/all',
        },
        {
            source: ['bgm.tv/anime/list/:id/wish'],
            target: '/bangumi.tv/user/collections/:id/2/1',
        },
        {
            source: ['bangumi.tv/anime/list/:id/wish'],
            target: '/bangumi.tv/user/collections/:id/2/1',
        },
    ],
    name: 'Bangumi 用户收藏列表',
    maintainers: ['youyou-sudo', 'honue'],
    handler,
};

async function handler(ctx) {
    const userId = ctx.req.param('id');
    const subjectType = ctx.req.param('subjectType') || '';
    const type = ctx.req.param('type') || '';

    const subjectTypeNames = {
        1: '书籍',
        2: '动画',
        3: '音乐',
        4: '游戏',
        6: '三次元',
    };

    const typeNames = getTypeNames(subjectType);
    const typeName = typeNames[type] || '';
    const subjectTypeName = subjectTypeNames[subjectType] || '';

    let descriptionFields: string;

    if (typeName && subjectTypeName) {
        descriptionFields = `${typeName}的${subjectTypeName}列表`;
    } else if (typeName) {
        descriptionFields = `${typeName}的列表`;
    } else if (subjectTypeName) {
        descriptionFields = `收藏的${subjectTypeName}列表`;
    } else {
        descriptionFields = '的Bangumi收藏列表';
    }

    const userDataUrl = `https://api.bgm.tv/v0/users/${userId}`;
    const userData = await ofetch(userDataUrl, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const collectionDataUrl = `https://api.bgm.tv/v0/users/${userId}/collections?${subjectType && subjectType !== 'all' ? `subject_type=${subjectType}` : ''}${type && type !== 'all' ? `&type=${type}` : ''}`;
    const collectionData = await ofetch(collectionDataUrl, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const userNickname = userData.nickname;
    const items = collectionData.data.map((item) => {
        const titles = item.subject.name_cn || item.subject.name;
        const updateTime = item.updated_at;
        const subjectId = item.subject_id;

        return {
            title: `${type === 'all' ? `${getTypeNames(item.subject_type)[item.type]}：` : ''}${titles}`,
            description: renderSubjectDescription({
                routeSubjectType: subjectType,
                subjectTypeName: subjectTypeNames[item.subject_type],
                subjectType: item.subject_type,
                subjectEps: item.subject.eps,
                epStatus: item.ep_status,
                score: item.subject.score,
                date: item.subject.date,
                picUrl: item.subject.images.large,
            }),
            link: `https://bgm.tv/subject/${subjectId}`,
            pubDate: timezone(parseDate(updateTime), 0),
        };
    });
    return {
        title: `${userNickname}${descriptionFields}`,
        link: `https://bgm.tv/user/${userId}/collections`,
        item: items,
        description: `${userNickname}${descriptionFields}`,
    };
}
