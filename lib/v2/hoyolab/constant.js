// 域名
const HOST = 'https://bbs-api-os.hoyolab.com';
// 活动列接口
const EVENT_LIST = '/community/community_contribution/wapi/event/list';
// 活动详情接口
const POST_FULL = '/community/post/wapi/getPostFull';
// 公告和资讯接口
const NEW_LIST = '/community/post/wapi/getNewsList';

const ICON = 'https://img-os-static.hoyolab.com/favicon.ico';
// 源网站链接
const LINK = 'https://www.hoyolab.com';

// 部分图片使用了禁止公开访问的域名
const PRIVATE_IMG = '<img src="https://hoyolab-upload-private.hoyolab.com/upload';
// 使用以下域名可以替换
const PUBLIC_IMG = '<img src="https://upload-os-bbs.hoyolab.com/upload';

// 游戏id
const GIDS_MAP = {
    1: 'Honkai Impact 3rd',
    2: '原神',
    4: '未定事件簿',
    5: 'HoYoLAB',
    6: '崩坏：星穹铁道',
    8: '绝区零',
};

// 公告类型
const TYPE_MAP = {
    1: '公告',
    2: '活动',
    3: '资讯',
};

module.exports = {
    PRIVATE_IMG,
    PUBLIC_IMG,
    LINK,
    ICON,
    POST_FULL,
    HOST,
    EVENT_LIST,
    NEW_LIST,
    GIDS_MAP,
    TYPE_MAP,
};
