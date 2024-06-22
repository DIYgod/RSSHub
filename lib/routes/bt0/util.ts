import { CookieJar } from 'tough-cookie';
import got from '@/utils/got';
const cookieJar = new CookieJar();

async function doGot(num, host, link) {
    if (num > 4) {
        throw new Error('The number of attempts has exceeded 5 times');
    }
    const response = await got.get(link, {
        cookieJar,
    });
    const data = response.data;
    const regex = /document\.cookie\s*=\s*"([^"]*)"/;
    const match = data.match(regex);
    if (match) {
        cookieJar.setCookieSync(match[1], host);
        return doGot(++num, host, link);
    }
    return data;
}

const genSize = (sizeStr) => {
    // 正则表达式，用于匹配数字和单位 GB 或 MB
    const regex = /^(\d+(\.\d+)?)\s*(gb|mb)$/i;
    const match = sizeStr.match(regex);

    if (!match) {
        return 0;
    }

    const value = Number.parseFloat(match[1]);
    const unit = match[3].toUpperCase();

    let bytes;
    switch (unit) {
        case 'GB':
            bytes = Math.floor(value * 1024 * 1024 * 1024);
            break;
        case 'MB':
            bytes = Math.floor(value * 1024 * 1024);
            break;
        default:
            bytes = 0;
    }
    return bytes;
};

export { doGot, genSize };
