import { Route } from '@/types';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export const route: Route = {
    path: '/tv/user/collections/:id/:subjectType?/:type?',
    categories: ['anime'],
    example: '/bangumi/tv/user/collections/sai/1/1',
    parameters: {
        id: '用户 id, 在用户页面地址栏查看',
        subjectType: {
            description: '全部类别: `空`、book: `1`、anime: `2`、music: `3`、game: `4`、real: `6`',
            options: [
                { value: '--', label: '--' },
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
                { value: '--', label: '--' },
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
    radar: [],
    name: 'Bangumi 用户收藏列表',
    maintainers: ['honue'],
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

    const typeNames = {
        1: '想看',
        2: '看过',
        3: '在看',
        4: '搁置',
        5: '抛弃',
    };

    const typeName = typeNames[type] || '';
    const subjectTypeName = subjectTypeNames[subjectType] || '';

    let descriptionFields = '';

    if (typeName && subjectTypeName) {
        descriptionFields = `${typeName}的${subjectTypeName}列表`;
    } else if (typeName) {
        descriptionFields = `${typeName}的列表`;
    } else if (subjectTypeName) {
        descriptionFields = `收藏的${subjectTypeName}列表`;
    } else {
        descriptionFields = '的Bangumi收藏列表';
    }

    const userDataurl = `https://api.bgm.tv/v0/users/${userId}`;
    const userData = await got(userDataurl, {
        method: 'get',
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const collectionDataurl = `https://api.bgm.tv/v0/users/${userId}/collections?subject_type=${subjectType}&type=${type}`;
    const collectionData = await got(collectionDataurl, {
        method: 'get',
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const userNickname = userData.data.nickname;
    const items = collectionData.data.data.map((item) => {
        const titles = item.subject.name_cn || item.subject.name;
        const updateTime = item.updated_at;
        const subjectid = item.subject_id;

        return {
            title: titles,
            link: `https://bgm.tv/subject/${subjectid}`,
            pubDate: timezone(parseDate(updateTime), 0),
            urls: `https://bgm.tv/subject/${subjectid}`,
        };
    });

    return {
        title: `${userNickname}${descriptionFields}`,
        link: `https://bgm.tv/user/${userId}/collections`,
        item: items,
        description: `${userNickname}${descriptionFields}`,
    };
}

