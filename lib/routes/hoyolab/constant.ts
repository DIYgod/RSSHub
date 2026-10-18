// API origin
const HOST = 'https://bbs-api-os.hoyolab.com';
// Article details API
const POST_FULL = '/community/post/wapi/getPostFull';
// Announcements and news API
const NEW_LIST = '/community/post/wapi/getNewsList';

// Human-readable website origin
const LINK = 'https://www.hoyolab.com';

// Some article images use a private upload host.
const PRIVATE_IMG = '<img src="https://hoyolab-upload-private.hoyolab.com/upload';
// Replace it with the public upload host.
const PUBLIC_IMG = '<img src="https://upload-os-bbs.hoyolab.com/upload';

// Official circle page types
const OFFICIAL_PAGE_TYPE = {
    2: 27,
    6: 39,
    8: 47,
    1: 31,
    4: 35,
    5: 43,
};

export { HOST, LINK, NEW_LIST, OFFICIAL_PAGE_TYPE, POST_FULL, PRIVATE_IMG, PUBLIC_IMG };
