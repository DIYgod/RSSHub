const got = require('@/utils/got');

const baseApiUrl = 'https://api.hashnode.com';

module.exports = async (ctx) => {
    const username = ctx.params.username;
    if (!username) {
        return;
    }

    const query = `
    {
        user(username: "${username}") {
        publication {
            posts{
            slug
            title
            brief
            coverImage
            }
        }
        }
    }
    `;

    const userUrl = `https://${username}.hashnode.dev`;
    const response = await got({
        method: 'post',
        url: baseApiUrl,
        headers: {
            Referer: userUrl,
            'Content-type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });

    const list = response.data.data.user.publication.posts;

    ctx.state.data = {
        title: `Hashnode by ${username}`,
        link: userUrl,
        item: list
            .map((item) => ({
                title: item.title,
                description: `<img src="${item.coverImage}"> ${item.brief}`,
                link: `${userUrl}/${item.slug}`,
            }))
            .filter((item) => item !== ''),
    };
};
