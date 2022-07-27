const got = require('@/utils/got');

const host = 'https://ifi-audio.com';

module.exports = async (ctx) => {
    const { val, id } = ctx.params;

    const url = host + '/wp-admin/admin-ajax.php';
    const response = await got({
        method: 'post',
        url,
        headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: 'action=ifi-ff-get-firmware&val=' + val + '&id=' + id,
    });
    const markup = response.data.data.markup;
    ctx.state.data = {
        title: 'iFi audio Download Hub',
        link: 'https://ifi-audio.com/download-hub/',
        description: 'iFi audio Download Hub',
        item: [
            {
                title: 'iFi audio Download Hub',
                description: markup,
                link: 'https://ifi-audio.com/download-hub/',
            },
        ],
    };
};
