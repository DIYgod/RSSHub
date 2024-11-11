import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import utils from './utils';

// https://www.bilibili.com/v/popular/rank/all

// 0 all https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all&web_location=333.934&w_rid=d4e0c1b83157e3d36836eb3c4258ef61&wts=1731320484
// 1 bangumi https://api.bilibili.com/pgc/web/rank/list?day=3&season_type=1&web_location=333.934&w_rid=2d46eff2d363c4960bc875e63e24df6c&wts=1731320507
// 2 guochan https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=4&web_location=333.934&w_rid=b26195dc9ee2f925bc196da68df341a5&wts=1731320523
// 3 guochuang https://api.bilibili.com/x/web-interface/ranking/v2?rid=168&type=all&web_location=333.934&w_rid=f99e5982b011eb24643a2daffb7baf00&wts=1731320537
// 4 documentary https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=3&web_location=333.934&w_rid=2067f7277cf49cbea4c5e5630eeb929a&wts=1731320556
// 5 douga https://api.bilibili.com/x/web-interface/ranking/v2?rid=1&type=all&web_location=333.934&w_rid=14bf53ce651e8d575d5982b24e1cebdf&wts=1731320579
// 6 music https://api.bilibili.com/x/web-interface/ranking/v2?rid=3&type=all&web_location=333.934&w_rid=70f4c870f860b9334ebe6e9fe835d3fe&wts=1731320595
// 7 dance https://api.bilibili.com/x/web-interface/ranking/v2?rid=129&type=all&web_location=333.934&w_rid=691f713f7fc6d3cc08174affcc59f97c&wts=1731321260
// 8 game https://api.bilibili.com/x/web-interface/ranking/v2?rid=4&type=all&web_location=333.934&w_rid=cac9f26f49da223cb8ab6f189250ec23&wts=1731320726
// 9 knowledge https://api.bilibili.com/x/web-interface/ranking/v2?rid=36&type=all&web_location=333.934&w_rid=79c274d74e90d93ac7adfd2df968288e&wts=1731320750
// 10 tech https://api.bilibili.com/x/web-interface/ranking/v2?rid=188&type=all&web_location=333.934&w_rid=115d9e69c48bf958622c4cc0ee861b57&wts=1731320766
// 11 sports https://api.bilibili.com/x/web-interface/ranking/v2?rid=234&type=all&web_location=333.934&w_rid=c618d12f36e2379bda0c9a2754cd71e0&wts=1731320783
// 12 car https://api.bilibili.com/x/web-interface/ranking/v2?rid=223&type=all&web_location=333.934&w_rid=753bc1395718051aa53aedaa3cd04d76&wts=1731320797
// 13 life https://api.bilibili.com/x/web-interface/ranking/v2?rid=160&type=all&web_location=333.934&w_rid=3e8895d4749e905173886dd387f657e9&wts=1731320823
// 14 food https://api.bilibili.com/x/web-interface/ranking/v2?rid=211&type=all&web_location=333.934&w_rid=9ec93cab672a98ea972dfb9cb7ed6368&wts=1731320838
// 15 animal https://api.bilibili.com/x/web-interface/ranking/v2?rid=217&type=all&web_location=333.934&w_rid=794e69434ec4a818f4d589e5306e9a21&wts=1731320852
// 16 kichiku https://api.bilibili.com/x/web-interface/ranking/v2?rid=119&type=all&web_location=333.934&w_rid=c5e35f3f247bc9294557ab90e0be166a&wts=1731320865
// 17 fashion https://api.bilibili.com/x/web-interface/ranking/v2?rid=155&type=all&web_location=333.934&w_rid=f3711c888057a8fef1f47da9cf4bcd86&wts=1731320878
// 18 ent https://api.bilibili.com/x/web-interface/ranking/v2?rid=5&type=all&web_location=333.934&w_rid=5ca1b2da22de1c9e818ac619d309fed2&wts=1731320889
// 19 cinephile https://api.bilibili.com/x/web-interface/ranking/v2?rid=181&type=all&web_location=333.934&w_rid=8f5cae08b232025f93b74feaefdc95d9&wts=1731320903
// 20 movie https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=2&web_location=333.934&w_rid=ccd42543ab1c4330e9f81fb52b098a9c&wts=1731320916
// 21 tv https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=5&web_location=333.934&w_rid=10fae974e8d30dd6bba11527fe17e551&wts=1731320934
// 22 variety https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=7&web_location=333.934&w_rid=c3105fd0dac70dcdf4f08ca6b5cbdb8f&wts=1731320948
// 23 origin https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=origin&web_location=333.934&w_rid=53100b7aeeca012399f4f8f3746bcbdb&wts=1731320960
// 24 rookie https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=rookie&web_location=333.934&w_rid=b8adda7447e2f115b2ed36495e436934&wts=1731320971

const ridNumberList = ['0', '1', '4', '168', '3', '1', '3', '129', '4', '36', '188', '234', '223', '160', '211', '217', '119', '155', '5', '181', '2', '5', '7', '0', '0'];
const ridChineseList = [
    '全站',
    '番剧',
    '国产动画',
    '国创相关',
    '纪录片',
    '动画',
    '音乐',
    '舞蹈',
    '游戏',
    '知识',
    '科技',
    '运动',
    '汽车',
    '生活',
    '美食',
    '动物圈',
    '鬼畜',
    '时尚',
    '娱乐',
    '影视',
    '电影',
    '电视剧',
    '综艺',
    '原创',
    '新人',
];
const ridEnglishList = [
    'all',
    'bangumi',
    'guochan',
    'guochuang',
    'documentary',
    'douga',
    'music',
    'dance',
    'game',
    'knowledge',
    'tech',
    'sports',
    'car',
    'life',
    'food',
    'animal',
    'kichiku',
    'fashion',
    'ent',
    'cinephile',
    'movie',
    'tv',
    'variety',
    'origin',
    'rookie',
];
const ridTypeList = [
    'x/rid',
    'pgc/web',
    'pgc/season',
    'x/rid',
    'pgc/season',
    'x/rid',
    'x/rid',
    'x/rid',
    'x/rid',
    'x/rid',
    'x/rid',
    'x/rid',
    'x/rid',
    'x/rid',
    'x/rid',
    'x/rid',
    'x/rid',
    'x/rid',
    'x/rid',
    'x/rid',
    'pgc/season',
    'pgc/season',
    'pgc/season',
    'x/type',
    'x/type',
];

export const route: Route = {
    path: '/ranking/:rid_index?/:embed?',
    name: '排行榜',
    maintainers: ['DIYgod', 'hyoban'],
    categories: ['social-media', 'popular'],
    view: ViewType.Videos,
    example: '/bilibili/ranking/0',
    parameters: {
        rid_index: {
            description: '排行榜分区 id 序号',
            default: '0',
            options: Array.from({ length: ridNumberList.length }, (_, i) => ({
                value: String(i),
                label: ridChineseList[i],
            })).filter((_, i) => !ridTypeList[i].startsWith('pgc/')),
        },
        embed: '默认为开启内嵌视频, 任意值为关闭',
    },
    handler,
};

function getAPI(ridIndex: number) {
    if (ridIndex < 0 || ridIndex >= ridNumberList.length) {
        throw new Error('Invalid rid index');
    }
    const rid = ridNumberList[ridIndex];
    const ridType = ridTypeList[ridIndex];
    const ridChinese = ridChineseList[ridIndex];
    const ridEnglish = ridEnglishList[ridIndex];

    let apiURL = '';

    switch (ridType) {
        case 'x/rid':
            apiURL = `https://api.bilibili.com/x/web-interface/ranking?rid=${rid}&type=all`;
            break;
        case 'pgc/web':
            apiURL = `https://api.bilibili.com/pgc/web/rank/list?day=3&season_type=${rid}`;
            break;
        case 'pgc/season':
            apiURL = `https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=${rid}`;
            break;
        case 'x/type':
            apiURL = `https://api.bilibili.com/x/web-interface/ranking?rid=0&type=${ridEnglish}`;
            break;
        default:
            throw new Error('Invalid rid type');
    }

    return {
        apiURL,
        referer: `https://www.bilibili.com/v/popular/rank/${ridEnglish}`,
        ridChinese,
        ridType,
        link: `https://www.bilibili.com/v/popular/rank/${ridEnglish}`,
    };
}

async function handler(ctx) {
    const ridIndex = ctx.req.param('rid_index') || '0';
    const embed = !ctx.req.param('embed');

    const { apiURL, referer, ridChinese, link, ridType } = getAPI(Number(ridIndex));
    if (ridType.startsWith('pgc/')) {
        throw new Error('This type of ranking is not supported yet');
    }

    const response = await got({
        method: 'get',
        url: apiURL,
        headers: {
            Referer: referer,
        },
    });

    const data = response.data.data || response.data.result;
    const list = data.list || [];
    return {
        title: `bilibili 排行榜-${ridChinese}`,
        link,
        item: list.map((item) => ({
            title: item.title,
            description: utils.renderUGCDescription(embed, item.pic, item.description || item.title, item.aid, undefined, item.bvid),
            pubDate: item.create && new Date(item.create).toUTCString(),
            author: item.author,
            link: !item.create || (new Date(item.create) / 1000 > utils.bvidTime && item.bvid) ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
        })),
    };
}
