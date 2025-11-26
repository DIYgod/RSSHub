import { setConfig } from '@/config';
import { Hono } from 'hono';
import type { RoutePath } from '@/../assets/build/route-paths';

let app: Hono;

export const init = async (conf: Record<string, any>) => {
    setConfig(
        Object.assign(
            {
                IS_PACKAGE: true,
            },
            conf
        )
    );
    app = (await import('@/app')).default;
};

export const request = async (path: RoutePath) => {
    const res = await app.request(path);
    return res.json();
};
