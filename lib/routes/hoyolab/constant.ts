// 域名
const HOST = 'https://bbs-api-os.hoyolab.com';
// 活动列接口
const EVENT_LIST = '/community/community_contribution/wapi/event/list';
// 活动详情接口
const POST_FULL = '/community/post/wapi/getPostFull';
// 公告和资讯接口
const NEW_LIST = '/community/post/wapi/getNewsList';

// 源网站链接
const LINK = 'https://www.hoyolab.com';

// 部分图片使用了禁止公开访问的域名
const PRIVATE_IMG = '<img src="https://hoyolab-upload-private.hoyolab.com/upload';
// 使用以下域名可以替换
const PUBLIC_IMG = '<img src="https://upload-os-bbs.hoyolab.com/upload';

// 公告类型
const OFFICIAL_PAGE_TYPE = {
    2: 27,
    6: 39,
    8: 47,
    1: 31,
    4: 35,
    5: 43,
};

export { PRIVATE_IMG, PUBLIC_IMG, LINK, POST_FULL, HOST, EVENT_LIST, NEW_LIST, OFFICIAL_PAGE_TYPE };
