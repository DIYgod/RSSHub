import * as cheerio from 'cheerio';

export const baseUrl = 'https://www.t66y.com';

const killRedircdn = (originUrl) => {
    const decodeStr = /.*\?http/g;
    const decodeSig = /______/g;
    const htmlSuffix = '&z';
    return originUrl.replaceAll(decodeStr, 'http').replaceAll(decodeSig, '.').replace(htmlSuffix, '');
};

export const parseContent = (htmlString) => {
    const $ = cheerio.load(htmlString);

    const content = $('div.tpc_content').eq(0);
    content.find('.t_like').remove();

    // Handle video
    // const video = $('a:nth-of-type(2)');
    // if (video) {
    //     const videoScript = video.attr('onclick');
    //     const regVideo = /https?:\/\/.*'/;
    //     const videoRes = regVideo.exec(videoScript);
    //     if (videoRes && videoRes.length !== 0) {
    //         let link = videoRes[0];
    //         link = link.slice(0, -1);
    //         $('iframe').attr('src', link);
    //     }
    // }
    // Handle img tag
    content.find('img').each((_, ele) => {
        const $ele = $(ele);
        const essData = $ele.attr('ess-data');
        if (essData) {
            $ele.attr('src', essData);
        }
        $ele.removeAttr('ess-data');
        $ele.removeAttr('iyl-data');
    });

    // Handle input tag
    // images = $('input');
    // for (const image of images) {
    //     $(image).replaceWith(`<img src="${$(image).attr('ess-data')}" />`);
    // }

    // Handle links
    content.find('a').each((_, ele) => {
        const $ele = $(ele);
        const href = $ele.attr('href');
        if (href?.includes('redircdn')) {
            $ele.attr('href', killRedircdn(href));
        }
    });

    return content.html();
};
