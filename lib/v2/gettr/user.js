const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const actionMap = {
    pub_pst: 'Published a post: ',
    shares_cm: 'Shared a comment: ',
    shares_pst: 'Shared a post: ',
};

module.exports = async (ctx) => {
    const baseUrl = 'https://gettr.com';
    const apiHost = 'https://api.gettr.com';
    const mediaHost = 'https://media.gettr.com';
    const { id } = ctx.params;

    const { data: posts } = await got(`${apiHost}/u/user/${id}/posts`, {
        // headers: {
        //     version: '2.7.0',
        //     'x-app-auth': '{"user": null, "token": null}',
        // },
        searchParams: {
            offset: 0,
            max: 20,
            dir: 'fwd',
            incl: 'posts|stats|userinfo|shared|liked|pvotes',
            fp: 'f_uo',
        },
    });
    const userInfo = posts.result.aux.uinf[id];

    const items = posts.result.data.list.map((post) => {
        const title = posts.result.aux.post[post.activity.pstid].txt;
        const description = art(path.join(__dirname, 'templates/post.art'), {
            post: posts.result.aux.post[post.activity.pstid],
            mediaHost,
        });
        return {
            title: `${actionMap[post.action]} ${title}`,
            description,
            pubDate: parseDate(post.cdate),
            updated: parseDate(post.udate),
            link: `${baseUrl}/post/${post.activity.pstid}`,
        };
    });

    ctx.state.data = {
        title: `${userInfo.nickname} on Gettr`,
        description: userInfo.dsc,
        link: `${baseUrl}/user/${id}`,
        image: `${mediaHost}/${userInfo.ico}`,
        language: 'en',
        item: items,
    };
};
