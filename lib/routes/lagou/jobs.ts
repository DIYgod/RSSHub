import crypto from 'node:crypto';

import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const apiUrl = 'https://www.lagou.com/jobs/v2/positionAjax.json';
const rsaPublicKey =
    '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnbJqzIXk6qGotX5nD521Vk/24APi2qx6C+2allfix8iAfUGqx0MK3GufsQcAt/o7NO8W+qw4HPE+RBR6m7+3JVlKAF5LwYkiUJN1dh4sTj03XQ0jsnd3BYVqL/gi8iC4YXJ3aU5VUsB6skROancZJAeq95p7ehXXAJfCbLwcK+yFFeRKLvhrjZOMDvh1TsMB4exfg+h2kNUI94zu8MK3UA7v1ANjfgopaE+cpvoulg446oKOkmigmc35lv8hh34upbMmehUqB51kqk9J7p8VMI3jTDBcMC21xq5XF7oM8gmqjNsYxrT9EVK7cezYPq7trqLX1fyWgtBtJZG7WMftKwIDAQAB\n-----END PUBLIC KEY-----';
const iv = Buffer.from('c558Gq0YQK2QUlMc');
const originHeader = JSON.stringify({ deviceType: 1 });

export const route: Route = {
    path: '/jobs/:position/:city',
    categories: ['programming'],
    example: '/lagou/jobs/JavaScript/上海',
    parameters: {
        position: '职位名，可以参考[拉勾网首页](https://www.lagou.com)的职位列表',
        city: '城市名，请参考[拉勾网支持的全部城市](https://www.lagou.com/jobs/allCity.html)',
    },
    name: '职位招聘',
    maintainers: ['hoilc'],
    features: { antiCrawler: true },
    description: `::: tip
拉勾网官方提供职位的[邮件订阅](https://www.lagou.com/s/subscribe.html)，请根据自身需要选择使用。
:::`,
    handler,
};

const getAesKey = () =>
    cache.tryGet(
        'lagou:aes-key',
        async () => {
            const aesKey = Array.from({ length: 32 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='[crypto.randomInt(65)]).join('');
            const response = await ofetch<{ content: { secretKeyValue: string } }>('https://gate.lagou.com/system/agreement', {
                method: 'POST',
                headers: { Origin: 'https://www.lagou.com', Referer: 'https://www.lagou.com/' },
                body: {
                    secretKeyDecode: crypto.publicEncrypt({ key: rsaPublicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(aesKey)).toString('base64'),
                },
            });
            return { aesKey, secret: response.content.secretKeyValue };
        },
        86400, // server set 24 hours
        false
    );

async function handler(ctx: Context) {
    const { position, city } = ctx.req.param();

    const { aesKey, secret } = await getAesKey();
    const key = Buffer.from(aesKey);
    const encrypt = (text: string) => {
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        return Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('base64');
    };
    const decrypt = (text: string) => {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const encrypted = Buffer.from(text, 'base64');
        return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    };

    const payload = JSON.stringify({ city, pn: 1, kd: position, px: 'new' });
    const code = crypto.createHash('sha256').update(`${originHeader}${apiUrl}${payload}`).digest('hex').toUpperCase();

    const { data } = await ofetch(apiUrl, {
        method: 'POST',
        headers: {
            Origin: 'https://www.lagou.com',
            Referer: `https://www.lagou.com/wn/jobs?kd=${encodeURIComponent(position)}&city=${encodeURIComponent(city)}`,
            traceparent: `00-${crypto.randomBytes(16).toString('hex')}-${crypto.randomBytes(8).toString('hex')}-01`,
            'x-k-header': secret,
            'x-s-header': encrypt(JSON.stringify({ originHeader, code })),
            'x-ss-req-header': JSON.stringify({ secret }),
            'x-requested-with': 'XMLHttpRequest',
        },
        body: new URLSearchParams({ data: encrypt(payload) }),
    });

    const list = JSON.parse(decrypt(data)).content.positionResult.result;

    return {
        title: `${position} - ${city} - 拉勾网`,
        link: `https://www.lagou.com/wn/jobs?kd=${encodeURIComponent(position)}&city=${encodeURIComponent(city)}&px=new`,
        item: list.map((item) => ({
            title: `${item.positionName}[${city === '全国' ? item.city + '·' : ''}${item.businessZones ? item.businessZones[0] : item.district}] - ${item.companyShortName}`,
            author: item.companyShortName,
            description: `薪资：${item.salary}<br>要求：${item.workYear} / ${item.education}<br>公司名称：${item.companyFullName}<br>公司描述：${item.industryField} / ${item.financeStage} / ${item.companySize}${
                item.companyLabelList && item.companyLabelList.length !== 0 ? '<br>公司标签：' + item.companyLabelList.join(', ') : ''
            }<br>职位优势：${item.positionAdvantage}${item.positionLables ? '<br>职位标签：' + item.positionLables.join(', ') : ''}${item.linestaion ? '<br>附近线路：' + item.linestaion : ''}`,
            link: `https://www.lagou.com/wn/jobs/${item.positionId}.html`,
            pubDate: timezone(parseDate(item.createTime), 8),
        })),
    };
}
