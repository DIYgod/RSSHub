import { afterEach, describe, expect, it, vi } from 'vitest';

import { parseScriptCallback, parseScriptData } from './parse-script-data';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('serialized script data', () => {
    it.each(['__DATA__', 'window.__DATA__', 'globalThis.__DATA__', 'self.__DATA__'])('normalizes the global target %s', (target) => {
        expect(parseScriptData(String.raw`window.__DATA__ = { title: "Hello\u0020世界", tags: ["a", "b"] };`, target)).toEqual({ title: 'Hello 世界', tags: ['a', 'b'] });
    });

    it('resolves variables, nested assignments, and data-only unary and logical expressions', () => {
        const source = 'var title="A &amp; B", unused=analytics(); window.pixiv=window.pixiv||{}; pixiv.novel={title, count:-2, available:!0, absent:void 0};';
        expect(parseScriptData(source, 'window.pixiv.novel')).toEqual({ title: 'A &amp; B', count: -2, available: true, absent: undefined });
    });

    it('reads parent-object assignments and static bracket targets', () => {
        expect(parseScriptData('window.pixiv={novel:{title:"Book"}};', 'self["pixiv"].novel')).toEqual({ title: 'Book' });
    });

    it('reads Nuxt IIFE parameters and object mutations without changing outer bindings', () => {
        const source = 'var a="outer";window.__NUXT__=(function(a,b,c){a.title=b;a.tags=c;return {data:[a,a],error:null}}({},"News",["tag"]));';
        const value = parseScriptData<{ data: Array<{ title: string; tags: string[] }>; error: null }>(source, '__NUXT__');
        expect(value).toEqual({
            data: [
                { title: 'News', tags: ['tag'] },
                { title: 'News', tags: ['tag'] },
            ],
            error: null,
        });
        expect(value.data[0]).toBe(value.data[1]);
        expect(parseScriptData(source, 'a')).toBe('outer');
    });

    it('preserves repeated var declarations and evaluates unused IIFE arguments in order', () => {
        const source = 'var a={value:1};var a;window.__DATA__=(function(x){return x})(a,a.value=2);';
        expect(parseScriptData(source, '__DATA__')).toEqual({ value: 2 });
    });

    it('does not call unrelated application code or access the host global object', () => {
        const fetchSpy = vi.fn();
        vi.stubGlobal('fetch', fetchSpy);
        vi.stubGlobal('__scriptDataSideEffect', 'unchanged');

        const value = parseScriptData('globalThis.__scriptDataSideEffect="changed";fetch("https://example.invalid/");window.__DATA__={ok:true};', '__DATA__');

        expect(value).toEqual({ ok: true });
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(Reflect.get(globalThis, '__scriptDataSideEffect')).toBe('unchanged');
    });

    it.each([
        'window.__DATA__ = fetch("https://example.invalid/");',
        'window.__DATA__ = Function("return 42")();',
        'window.__DATA__ = { get secret() { return fetch("https://example.invalid/"); } };',
        'window.__DATA__ = (function(){ while(true){} return {}; })();',
        'window.__DATA__ = (function(){ return {}; })(fetch("https://example.invalid/"));',
    ])('rejects unsupported expressions required by the target without executing them', (source) => {
        const fetchSpy = vi.fn();
        vi.stubGlobal('fetch', fetchSpy);
        expect(() => parseScriptData(source, '__DATA__')).toThrow(/Unsupported|ordinary/);
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it.each(['__proto__', 'constructor', 'prototype'])('rejects the unsafe property %s', (key) => {
        expect(() => parseScriptData(`window.__DATA__={"${key}":{polluted:true}};`, '__DATA__')).toThrow('Unsafe script data property');
        expect(() => parseScriptData(`var value={};value["${key}"]={polluted:true};window.__DATA__=value;`, '__DATA__')).toThrow('Unsafe script data property');
        expect(Object.hasOwn(Object.prototype, 'polluted')).toBe(false);
    });

    it.each(['window.__DATA__()', 'window[computed]', 'window.__DATA__; unrelated()', 'window.__proto__'])('rejects unsupported target paths: %s', (target) => {
        expect(() => parseScriptData('window.__DATA__={};', target)).toThrow();
    });

    it('reports missing targets and unresolved variable dependencies', () => {
        expect(() => parseScriptData('unrelated();', '__DATA__')).toThrow('target was not found');
        expect(() => parseScriptData('var data=unrelated();window.__DATA__=data;', '__DATA__')).toThrow('Unsupported script data expression');
    });

    it.each(['if(true){window.__DATA__.value=2;}', 'Object.assign(window.__DATA__,{value:2});', 'window.__DATA__.value++;', 'window.__DATA__[unknown()]={};'])(
        'rejects unsupported code that could change extracted data: %s',
        (suffix) => {
            expect(() => parseScriptData(`window.__DATA__={value:1};${suffix}`, '__DATA__')).toThrow('Unsupported script data');
        }
    );

    it.each(['if(true){window.__DATA__.newField=2;}', 'var ignored=Object.assign(window.__DATA__,{value:2});', 'window.ignored=Object.assign(window.__DATA__,{value:2});'])(
        'rejects mutations hidden in new properties and unused assignments: %s',
        (suffix) => {
            expect(() => parseScriptData(`window.__DATA__={};${suffix}`, '__DATA__')).toThrow('Unsupported script data');
        }
    );

    it('rejects cyclic data and excessively large sources or sparse arrays', () => {
        expect(() => parseScriptData('var a={};a.self=a;window.__DATA__=a;', '__DATA__')).toThrow('Cyclic script data');
        expect(() => parseScriptData(' '.repeat(2_000_001), '__DATA__')).toThrow('size limit');
        expect(() => parseScriptData('window.__DATA__=(function(){var a=[];a[100000]={};return a})();', '__DATA__')).toThrow('bounded numeric indexes');
    });
});

describe('serialized callback data', () => {
    it('extracts a DWR callback argument without invoking the callback', () => {
        const callback = vi.fn();
        vi.stubGlobal('dwr', { engine: { _remoteHandleCallback: callback } });
        const source = '(function(){if(!window.dwr)return;var s0=[],s1={};s1.post={title:"Entry"};s0[0]=s1;dwr.engine._remoteHandleCallback("493053","0",s0);})();';

        expect(parseScriptCallback(source, 'dwr.engine._remoteHandleCallback')).toEqual([{ post: { title: 'Entry' } }]);
        expect(callback).not.toHaveBeenCalled();
    });

    it('supports empty public DWR responses and explicit argument positions', () => {
        const source = '//#DWR-INSERT\n//#DWR-REPLY\ndwr.engine._remoteHandleCallback("493053","0",[]);';
        expect(parseScriptCallback(source, 'window.dwr.engine._remoteHandleCallback')).toEqual([]);
        expect(parseScriptCallback(source, 'dwr.engine._remoteHandleCallback', 0)).toBe('493053');
    });

    it('evaluates all callback arguments in order and does not keep an earlier successful capture after an invalid one', () => {
        const source = 'var a={value:1};dwr.engine._remoteHandleCallback(a.value=2,"0",a);';
        expect(parseScriptCallback(source, 'dwr.engine._remoteHandleCallback')).toEqual({ value: 2 });
        expect(() => parseScriptCallback(`${source}dwr.engine._remoteHandleCallback("0","0",unknown());`, 'dwr.engine._remoteHandleCallback')).toThrow();
    });

    it('rejects missing callbacks and external calls used as the data argument', () => {
        const fetchSpy = vi.fn();
        vi.stubGlobal('fetch', fetchSpy);
        expect(() => parseScriptCallback('unrelated();', 'dwr.engine._remoteHandleCallback')).toThrow('callback was not found');
        expect(() => parseScriptCallback('dwr.engine._remoteHandleCallback("0","0",fetch("https://example.invalid/"));', 'dwr.engine._remoteHandleCallback')).toThrow();
        expect(() => parseScriptCallback('', 'callback', -1)).toThrow('non-negative integer');
        expect(() => parseScriptCallback('dwr["engine._remoteHandleCallback"]("0","0",[]);', 'dwr.engine._remoteHandleCallback')).toThrow('callback was not found');
        expect(fetchSpy).not.toHaveBeenCalled();
    });
});
