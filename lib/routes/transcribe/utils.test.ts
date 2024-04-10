import { config } from '@/config';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { transcribe } from './utils';

describe('utils', () => {
    it(
        async () => {
            if (config.openai.apiKey) {
                const testFilePath = path.resolve(typeof __dirname === 'undefined' ? path.dirname(fileURLToPath(import.meta.url)) : __dirname, './jfk.wav');
                // 读取文件为 blob
                const file = readFileSync(testFilePath);
                const { text } = await transcribe(new Blob([file]), 'en', 'test');
                expect(text).not.toEqual('');
            }
        },
        {
            timeout: 60 * 1000,
        }
    );
});
