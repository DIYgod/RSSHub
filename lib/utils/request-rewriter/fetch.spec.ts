import { getCurrentCell, setCurrentCell } from 'node-network-devtools';
import { useCustomHeader } from './fetch';
import { describe, beforeEach, afterEach, test, expect } from 'vitest';

describe('useCustomHeader', () => {
    let originalEnv: string;

    beforeEach(() => {
        originalEnv = process.env.NODE_ENV || 'test';
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    test('should register request with custom headers in dev environment', () => {
        process.env.NODE_ENV = 'dev';

        const headers = new Headers();
        headers.set('Authorization', 'Bearer token');

        const req: any = { requestHeaders: {} };
        setCurrentCell({
            request: req,
            pipes: [],
            isAborted: false,
        });

        useCustomHeader(headers);

        const cell = getCurrentCell();
        expect(cell).toBeDefined();

        let request = req;
        if (cell) {
            for (const { pipe } of cell.pipes) {
                request = pipe(request);
            }
        }

        expect(request.requestHeaders.authorization).toEqual('Bearer token');
    });

    test('should not register request in non-dev environment', () => {
        process.env.NODE_ENV = 'production';

        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        const req: any = { requestHeaders: {} };

        setCurrentCell({
            request: req,
            pipes: [],
            isAborted: false,
        });
        useCustomHeader(headers);

        const cell = getCurrentCell();
        expect(cell).toBeDefined();

        let request = req;
        if (cell) {
            for (const { pipe } of cell.pipes) {
                request = pipe(request);
            }
        }

        expect(req.requestHeaders['content-Type']).toBeUndefined();
    });
});
