const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const axios = require('../../utils/axios');
const https = require('https');
const domain = 'https://www.xgmn5.com';
const encoding = 'gb18030';
const instance = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Connection': 'keep-alive'
    },
    responseType: 'arraybuffer',
    httpsAgent: new https.Agent({keepAlive: true, maxSockets: 200})
});

instance.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
    const config = err.config;
    // If config does not exist or the retry option is not set, reject
    if (!config || !config.retry) {
        return Promise.reject(err);
    }

    // Set the variable for keeping track of the retry count
    config.__retryCount = config.__retryCount || 0;

    // Check if we've maxed out the total number of retries
    if (config.__retryCount >= config.retry) {
        // Reject with the error
        return Promise.reject(err);
    }

    // Increase the retry count
    config.__retryCount += 1;

    // Create new romise to handle exponential backoff
    const backoff = new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, config.retryDelay || 5);
    });

    // Return the promise in which recalls axios to retry the request
    return backoff.then(function() {
        return axios(config);
    });
});

instance.retry = 2;
instance.retryDelay = 1;

const _encodeStr = (x) => iconv.encode(x, encoding).reduce((a, b) => a + '%' + b.toString(16), '').toUpperCase();

async function loadAlbum(albumLink) {
    const albumID = albumLink.split('/').slice(-1)[0];
    const albumResponse = await instance.get(albumLink);
    const albumData = iconv.decode(albumResponse.data, encoding);
    const $$ = cheerio.load(albumData);
    const albumName = $$('.title').text().trim();

    let timeShift = albumName.match(/\d+/); // find vol number in name
    if (timeShift) {
       timeShift = (24 * 60 * 60 - Number(timeShift[0])) * 1000;
    } else {
       timeShift = 12 * 60 * 60 * 1000;
    }
    const date = new Date(RegExp(/\d{4}-\d{2}-\d{2}/).exec($$('iframe').closest('td').text())[0]);
    const pubDate = new Date(date.getTime() + timeShift).toUTCString();
    const albumPages = $$('.page').first().children('a').map(function(i, el) {return domain + el.attribs.href;}).toArray().slice(0, -1);

    const promises = albumPages.map(async (x) => {
        const pageRes = await instance.get(x);
        const $ = cheerio.load(iconv.decode(pageRes.data, encoding));
        const thisImgs = $('.img p img').map(function(i, el) {return domain + el.attribs.src; }).toArray();
        return Promise.resolve(thisImgs);
    });

    try {
        const result = await Promise.all(promises);
        const imgs = [].concat.apply([], result);
        let nP = RegExp(/(\d+)P/).exec(albumName);
        if (nP) {
            nP = Number(nP[1]);
            if (imgs.length < nP) {
                const temp1 = imgs[0].split('/');
                const temp2 = temp1.slice(0, -1).join('/');
                const f0 = Number(RegExp(/\d+/).exec(temp1[temp1.length - 1])[0]);
                const ext = temp1[temp1.length - 1].split('.')[1];
                for (let i = imgs.length + 1; i < nP + 1; i++) {
                    // fallback method if the owner of the website doesn't post all images
                    // it doesn't always work
                    imgs.push(temp2 + '/' + (f0 + i - 1).toString() + '.' + ext);
                }
            }
        }
        return {'albumName': albumName, 'imgLinks': imgs, 'pubDate': pubDate, 'id': albumID};
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadAlbum,
    instance,
    domain,
    encoding,
    _encodeStr
};