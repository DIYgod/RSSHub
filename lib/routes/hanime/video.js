const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'POST',
        url: 'https://search.hanime.tv/',
        headers: {
            Referer: 'https://hanime.tv/',
            'Content-Type': 'application/json;charset=utf-8',
        },
        data: JSON.stringify({
            search_text: '',
            tags: [],
            tags_mode: 'AND',
            brands: [],
            blacklist: [],
            order_by: 'created_at_unix',
            ordering: 'desc',
            page: 0,
        }),
    });

    const data = response.data.hits;
    const list = JSON.parse(data);

    ctx.state.data = {
        title: 'Hanime',
        link: 'https://hanime.tv/',
        item: await Promise.all(
            list &&
                list.map((item) => {
                    const videoUrl = 'https://hanime.tv/hentai-videos/' + item.slug;
                    const videoImage = 'https://i1.wp.com/htvassets.club/images/storyboards/' + item.slug + '-720p-v1x.jpg';
                    const videoCover = item.cover_url;
                    const videoDescription = item.description;
                    const videoTags = item.tags;
                    const videoBrand = item.brand;
                    const videoEnglishName = item.name;
                    const videoName = item.titles;
                    const videoJapanseName = videoName.slice(-1);

                    return {
                        title: videoEnglishName,
                        description:
                            'Name: '.bold() +
                            videoJapanseName +
                            '<br>' +
                            'Brand: '.bold() +
                            videoBrand +
                            '<br>' +
                            'Tags: '.bold() +
                            videoTags +
                            '<br>' +
                            'Description: '.bold() +
                            videoDescription +
                            '<br>' +
                            '<img referrerpolicy="no-referrer" src="' +
                            videoCover +
                            '">' +
                            '<br>' +
                            '<img referrerpolicy="no-referrer" src="' +
                            videoImage +
                            '">',
                        link: videoUrl,
                    };
                })
        ),
    };
};
