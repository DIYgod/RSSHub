import CryptoJS from 'crypto-js';
import { CronJob } from 'cron';

interface CookieItem {
    domain: string;
    name: string;
    value: string;
    path: string;
    expirationDate: number;
    hostOnly: boolean;
    httpOnly: boolean;
    secure: boolean;
    sameSite: string;
}

interface CookieData {
    [key: string]: CookieItem[];
}

interface DecryptedData {
    cookie_data: CookieData;
    local_storage_data: Record<string, any>;
}

globalThis.cookieCloudItems = [] as CookieItem[];

const cloudCookie = async (host: string, uuid: string, password: string) => {
    let cookies: CookieItem[] = [];
    try {
        const url = `${host}/get/${uuid}`;
        const ret = await fetch(url);
        const json = await ret.json();
        if (json && json.encrypted) {
            const { cookie_data } = cookieDecrypt(uuid, json.encrypted, password);
            for (const key in cookie_data) {
                if (!cookie_data.hasOwnProperty(key)) {
                    continue;
                }
                cookies = cookies.concat(
                    cookie_data[key].map((item) => {
                        if (item.sameSite === 'unspecified') {
                            item.sameSite = 'Lax';
                        }
                        return item;
                    })
                );
            }
        }
    } catch {
        /* empty */
    }
    globalThis.cookieCloudItems = cookies;
};

const cookieDecrypt = (uuid: string, encrypted: string, password: string) => {
    const the_key = CryptoJS.MD5(`${uuid}-${password}`).toString().substring(0, 16);
    const decrypted = CryptoJS.AES.decrypt(encrypted, the_key).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted) as DecryptedData;
};

let cookieCloudSyncJob: CronJob | null = null;
export const createCookieCloudSyncJob = (config) => {
    const cookieCloudHost = config.host;
    const cookieCloudUuid = config.uuid;
    const cookieCloudPassword = config.password;
    cookieCloudSyncJob?.stop();
    if (cookieCloudHost !== undefined && cookieCloudUuid !== undefined && cookieCloudPassword !== undefined) {
        cookieCloudSyncJob = CronJob.from({
            cronTime: config.updateCron,
            async onTick() {
                await cloudCookie(cookieCloudHost, cookieCloudUuid, cookieCloudPassword);
            },
            start: true,
            runOnInit: true,
        });
    }
};

interface CookieCloudQueryParam {
    // domain of cookie
    domain: string;
    // optional cookie key, leave it undefined to get all cookie
    name?: string;
    // optional cookie path
    path?: string;
    // optional default value if no cookie matched.
    default_value?: string;
}

export type CookieCloudQuery = () => string | undefined;

export const cookieCloudQuery =
    (query: CookieCloudQueryParam): CookieCloudQuery =>
    () => {
        let result: string | undefined;
        for (const cookieCloudItem of globalThis.cookieCloudItems || []) {
            if (cookieCloudItem.domain === query.domain && query.path !== undefined && cookieCloudItem.path === query.path) {
                if (query.name === undefined) {
                    result = (result || '') + `${cookieCloudItem.name}=${cookieCloudItem.value};`;
                    continue;
                }
                if (cookieCloudItem.name === query.name) {
                    result = cookieCloudItem.value;
                    break;
                }
            }
        }
        return result || query.default_value;
    };
