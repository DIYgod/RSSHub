module.exports = {
    'qq.com': {
        _name: '腾讯',
        'mp.weixin': [
            {
                title: '微信公众号栏目',
                docs: 'https://docs.rsshub.app/new-media.html#gong-zhong-hao-lan-mu-fei-tui-song-li-shi-xiao-xi',
                source: '/mp/homepage',
                target: (params, url) => `/wechat/mp/homepage/${new URL(url).searchParams.get('__biz')}/${new URL(url).searchParams.get('hid')}/${new URL(url).searchParams.get('cid') ? new URL(url).searchParams.get('cid') : ''}`,
            },
            {
                title: '微信公众号话题',
                docs: 'https://docs.rsshub.app/new-media.html#wei-xin-gong-zhong-hao-wen-zhang-hua-ti-tag',
                source: '/mp/appmsgalbum',
                target: (params, url) => `/wechat/mp/msgalbum/${new URL(url).searchParams.get('__biz')}/${new URL(url).searchParams.get('album_id')}`,
            },
        ],
        egame: [
            {
                title: '企鹅电竞直播间',
                docs: 'https://docs.rsshub.app/live.html#qi-e-dian-jing-zhi-bo-jian-kai-bo',
                source: '/:id',
                target: (params) => {
                    if (params.id.match(/^\d+$/)) {
                        return '/egameqq/room/:id';
                    }
                },
            },
        ],
        v: [
            {
                title: '视频 - 播放列表',
                docs: 'https://docs.rsshub.app/multimedia.html#teng-xun-shi-pin',
                source: '/x/cover/:id',
                target: (params) => {
                    const id = params.id.match('(.*).html')[1];
                    return id ? `/tencentvideo/playlist/${id}` : '';
                },
            },
            {
                title: '视频 - 播放列表',
                docs: 'https://docs.rsshub.app/multimedia.html#teng-xun-shi-pin',
                source: '/x/cover/:id/:detail',
                target: '/tencentvideo/playlist/:id',
            },
        ],
        'wiki.connect': [
            {
                title: 'QQ 互联 SDK 更新日志',
                docs: 'https://docs.rsshub.app/program-update.html#qq-hu-lian-sdk',
                source: '/',
                target: (_params, url) => `/tencent/qq/sdk/changelog/${new URL(url).pathname === '/ios_sdk历史变更' ? 'iOS' : 'Android'}`,
            },
        ],
    },
};
