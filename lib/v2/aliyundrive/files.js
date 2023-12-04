const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { share_id, parent_file_id } = ctx.params;
    const url = `https://www.aliyundrive.com/s/${share_id}${parent_file_id ? `/folder/${parent_file_id}` : ''}`;

    const headers = {
        referer: 'https://www.aliyundrive.com/',
        origin: 'https://www.aliyundrive.com',
        'x-canary': 'client=web,app=share,version=v2.3.1',
    };

    const shareRes = await got.post('https://api.aliyundrive.com/adrive/v3/share_link/get_share_by_anonymous', {
        params: {
            share_id,
        },
        json: {
            share_id,
        },
        headers,
    });

    const tokenRes = await got.post('https://api.aliyundrive.com/v2/share_link/get_share_token', {
        headers,
        json: {
            share_id,
        },
    });
    const share_token = tokenRes.data.share_token;

    const listRes = await got.post('https://api.aliyundrive.com/adrive/v2/file/list_by_share', {
        headers: {
            ...headers,
            'x-share-token': share_token,
        },
        json: {
            limit: 100,
            order_by: 'created_at',
            order_direction: 'DESC',
            parent_file_id: parent_file_id || 'root',
            share_id,
        },
    });

    const result = listRes.data.items.map((item) => ({
        title: item.name,
        description: item.name + (item.thumbnail ? `<img src="${item.thumbnail}">` : ''),
        link: url,
        pubDate: item.created_at,
        updated: item.updated_at,
        guid: item.file_id,
    }));

    ctx.state.data = {
        title: `${shareRes.data.display_name || `${share_id}${parent_file_id ? `-${parent_file_id}` : ''}`}-阿里云盘`,
        link: url,
        item: result,
    };
};
