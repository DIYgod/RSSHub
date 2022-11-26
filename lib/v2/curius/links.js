const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const username = ctx.params.name;

    const name_response = await got(`https://curius.app/api/users/${username}`, {
        headers: {
            Referer: `https://curius.app/${username}`,
        },
    });

    const data = name_response.data;

    const uid = data.user.id;
    const name = `${data.user.firstName} ${data.user.lastName}`;

    const response = await got(`https://curius.app/api/users/${uid}/links?page=0`, {
        headers: {
            Referer: `https://curius.app/${username}`,
        },
    });

    const items = response.data.userSaved.map((item) => ({
        title: item.title,
        description: art(path.join(__dirname, 'templates/description.art'), {
            item,
        }),
        link: item.link,
        pubDate: parseDate(item.createdDate),
        guid: `curius:${username}:${item.id}`,
    }));

    ctx.state.data = {
        title: `${name} - Curius`,
        link: `https://curius.app/${username}`,
        description: `${name} - Curius`,
        allowEmpty: true,
        item: items,
    };
};
