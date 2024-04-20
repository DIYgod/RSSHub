const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'POST',
        url: 'https://search.htv-services.com/',
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
        item: list.map((item) => {
            // 替换图片地址
            const coverreg = /(https:\/\/)(static-assets.droidbuzz.top\/images\/covers\/.*)/;
            const imagereg = /(https:\/\/)(static-assets.droidbuzz.top\/images\/)(posters)(.*)(-pv1.png)/;
            const videoUrl = 'https://hanime.tv/hentai-videos/' + item.slug;
            // 视频预览图，可通过视频页面的预览图片获取
            const videoImage = item.poster_url;
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
                    videoEnglishName +
                    ' (' +
                    videoJapanseName +
                    ')' +
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
                    '<img src="' +
                    videoCover.replace(coverreg, '$1i1.wp.com/$2') +
                    '">' +
                    '<br>' +
                    '<img src="' +
                    videoImage.replace(imagereg, '$1i1.wp.com/$2storyboards$4-720p-v1x.jpg') +
                    '">',
                link: videoUrl,
            };
        }),
    };
};
