import { randomBytes } from 'node:crypto';

import { sm2, sm3, sm4 } from 'sm-crypto-v2';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const baseUrl = 'https://www.95598.cn';
export const link = `${baseUrl}/osgweb/blackoutNotice`;

const appKey = '7e5b5e84ddad4994b0ebc68dedca4962';
const appSecret = '2bc37a881e1541aaa6e6e174658d150b';
const pubKey = '042D12DFBC179202AC4B7B7BADCDA6FF7B604339263F6AB732CE7107B7EA3830A2CA714DC303920D3CFF7647D898F1A8CC6C24E9EC3CC194E22D984AF7E16B42DC';

const utf8Bytes = (str: string) => Buffer.from(str, 'utf8');
const sm4Key = (uuid: string) => utf8Bytes(uuid).subarray(0, 16);
const sm4Iv = (uuid: string) => utf8Bytes(uuid.slice(0, 8) + uuid.slice(-8));

const sm4Encrypt = (payload: unknown, uuid: string) => {
    const plain = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const cipher = sm4.encrypt(utf8Bytes(plain), sm4Key(uuid), {
        mode: 'cbc',
        iv: sm4Iv(uuid),
        output: 'array',
    });
    return Buffer.from(cipher).toString('base64');
};

const sm4Decrypt = (cipher: string, uuid: string) => {
    const plain = sm4.decrypt(Buffer.from(cipher, 'base64'), sm4Key(uuid), {
        mode: 'cbc',
        iv: sm4Iv(uuid),
        output: 'array',
    });
    return JSON.parse(Buffer.from(plain).toString('utf8'));
};

const request = async (path: string, payload: unknown, uuid: string, publicKey: string, headers?: Record<string, string>) => {
    const timestamp = Date.now();
    const data = sm4Encrypt(payload, uuid);
    const skey = sm2.doEncrypt(Buffer.from(uuid, 'utf8').toString('hex'), publicKey, 1);
    const response = await ofetch(`${baseUrl}/api${path}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json;charset=UTF-8',
            'Content-Type': 'application/json;charset=UTF-8',
            appKey,
            source: '0901',
            wsgwType: 'web',
            version: '1.0',
            timestamp: String(timestamp),
            Referer: link,
            ...headers,
        },
        body: {
            data: data + sm3(data + timestamp),
            skey: `04${skey}`,
            client_id: appKey,
            timestamp: String(timestamp),
        },
    });
    return sm4Decrypt(response.encryptData, uuid);
};

export async function createClient() {
    const uuid = randomBytes(16).toString('hex');
    const session = await request(
        '/oauth2/outer/c02/f02',
        {
            client_secret: appSecret,
            client_id: appKey,
        },
        uuid,
        pubKey
    );
    const { keyCode, publicKey } = session.data;

    return {
        post: (path: string, payload: unknown, headers?: Record<string, string>) => request(path, payload, uuid, publicKey, { keyCode, ...headers }),
    };
}

type Division = {
    /** region name, e.g. 南京市 */
    codeName: string;
    /** GB/T 2260 division code */
    codeValue: string;
    /** 02 province, 03 city, 04 district */
    content0: string;
    /** supply company code the outage query is keyed on */
    content2: string;
    /** provincial company code, sent as the query target */
    content3: string;
};

export const division = (code: string) => cache.tryGet(`sgcc:divisionGb:${code}`, (): Promise<Division[]> => ofetch(`${baseUrl}/pubcode/app/divisionGb/${code}.json`));

export const parentOf = (adcode: string) => (adcode.endsWith('0000') ? '-1' : adcode.endsWith('00') ? `${adcode.slice(0, 2)}0000` : `${adcode.slice(0, 4)}00`);
