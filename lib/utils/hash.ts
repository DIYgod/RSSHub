import { hash } from 'node:crypto';

export const md5 = (data: string) => hash('md5', data);
export const sha1 = (data: string) => hash('sha1', data);
export const sha256 = (data: string) => hash('sha256', data);
export const sha512 = (data: string) => hash('sha512', data);
