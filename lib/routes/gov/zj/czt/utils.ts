import { randomBytes } from 'node:crypto';

import cache from '@/utils/cache';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';

export const zfcgBaseUrl = 'https://zfcg.czt.zj.gov.cn';

export const signHeaders = (method: string, pathWithQuery: string, body = '') => {
    const timestamp = String(Date.now());
    const nonce = Array.from(randomBytes(16), (b) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[b % 62]).join('');
    const secret = 'zcy@148946';
    const sign = md5([method, pathWithQuery, body, timestamp, nonce, secret].join('\n'));
    return { 'X-Timestamp': timestamp, 'X-Nonce': nonce, 'X-Sign': sign, 'X-Sign-Version': 'v1' };
};

type CategoryNode = {
    id: number;
    name: string;
    code: string;
    children?: CategoryNode[];
};

export type FlatCategory = Pick<CategoryNode, 'id' | 'name' | 'code'>;

const flatten = (nodes: CategoryNode[], parentName?: string): FlatCategory[] =>
    nodes.flatMap((node) => [
        {
            id: node.id,
            name: parentName ? `${parentName} - ${node.name}` : node.name,
            code: node.code,
        },
        ...(node.children?.length ? flatten(node.children, node.name) : []),
    ]);

export const getCategories = () =>
    cache.tryGet('zfcg:category', async () => {
        const path = `/admin/category/home/categoryTreeFind?parentId=600007&siteId=110&timestamp=${Math.floor(Date.now() / 1000)}`;
        const { result } = await ofetch(`${zfcgBaseUrl}${path}`, {
            headers: signHeaders('GET', path),
        });
        return flatten(result.data);
    });
