const cheerio = require('cheerio');

const parseContent = (htmlString) => {
    const $ = cheerio.load(htmlString);

    const title = $('h1.cd_works-title');
    const author = $('.cd_user-box-main a.cd_user-name');
    const time = $('.cd_dtl_data')
        .text()
        .match(/\d+\/\d+\/\d+ \d+:\d+:\d+/)[0];

    const blank = cheerio.load('<div></div>');
    const content = blank('div');

    // description
    $('p.cd_dtl_cap').appendTo(content);

    // image
    $('.illust-whole').appendTo(content);

    // audio
    const testAudio = htmlString.match(/initNotLoginAudioFunc\(([\S\s]*?)\);/m);
    if (testAudio) {
        const audioInfo = testAudio[1];
        const contentId = audioInfo.match(/contentId:\s*'(.*?)',/)[1];
        const createDate = audioInfo.match(/createDate:\s*'(.*?)',/)[1];
        const audio_url = `https://cdn.piapro.jp/mp3_a/${contentId.substring(0, 2)}/${contentId}_${createDate}_audition.mp3`;
        $(`<audio src="${audio_url}" controls loop></audio>`).appendTo(content);
        $('img#bigJacket_1').appendTo(content);
    }

    // text
    $('.main_txt').appendTo(content);

    return {
        title: title.text().trim(),
        author: author.text().trim(),
        description: content.html(),
        pubDate: new Date(time),
    };
};

module.exports = {
    parseContent,
};
