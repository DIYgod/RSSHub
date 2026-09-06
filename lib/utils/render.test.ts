import { describe, expect, it } from 'vitest';

import { Atom as RenderAtom, json as renderJson, RSS as RenderRSS, rss3 as renderRss3 } from '@/utils/render';
import Atom from '@/views/atom';
import jsonView from '@/views/json';
import RSS from '@/views/rss';
import rss3View from '@/views/rss3';

describe('view exports', () => {
    it('re-exports view helpers from render', () => {
        expect(RenderAtom).toBe(Atom);
        expect(RenderRSS).toBe(RSS);
        expect(renderJson).toBe(jsonView);
        expect(renderRss3).toBe(rss3View);
    });
});
