import "../../setup";

import { readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { assertSpecExtra } from "@/types/spec-extra.zod";
import jsonView from "@/views/json";

const fixture = JSON.parse(
    readFileSync(
        path.join(import.meta.dirname, "../../fixtures/spec-netflix.json"),
        "utf-8",
    ),
) as { _extras: unknown[] };

const NETFLIX_TITLE_ID = "81249997";

afterEach(() => {
    delete process.env.TMDB_API_KEY;
});

async function callHandler(netflixTitleId: string) {
    process.env.TMDB_API_KEY = "test-tmdb-key";
    const { route } = await import("@/routes/spec/netflix");
    const ctx = {
        req: { param: (k: string) => ({ netflixTitleId })[k] },
    } as any;
    return route.handler(ctx);
}

describe("spec/netflix route", () => {
    it("matches snapshot — most recent _extra matches the recorded fixture", async () => {
        const data = await callHandler(NETFLIX_TITLE_ID);
        expect(data.item!.length).toBeGreaterThan(0);
        expect(data.item![0]._extra).toEqual(fixture._extras[0]);
    });

    it("happy path — returns episodes with _extra", async () => {
        const data = await callHandler(NETFLIX_TITLE_ID);
        expect(data.item!.length).toBeGreaterThan(0);
        const item = data.item![0];
        expect(item._extra?.platform).toBe("netflix");
        expect(item._extra?.type).toBe("netflix/episode");
        expect(item._extra?.netflixTitleId).toBe(NETFLIX_TITLE_ID);
        expect(item._extra?.tmdbSeriesId).toBe("93405");
        expect(item._extra?.imdbId).toBe("tt10919420");
        expect(item._extra?.episodeLabel).toBe("S03E06");
    });

    it('sets subtitleStatus="none" and empty captionLanguages on the wire', async () => {
        const data = await callHandler(NETFLIX_TITLE_ID);
        const item = data.item![0];
        expect(item._extra?.subtitleStatus).toBe("none");
        expect(item._extra?.captionLanguages).toEqual([]);
    });

    it("sorts items by pubDate descending", async () => {
        const data = await callHandler(NETFLIX_TITLE_ID);
        const dates = data.item!.map((i) => i._extra?.publishedAt);
        const sorted = [...dates].toSorted((a, b) =>
            (b ?? "").localeCompare(a ?? ""),
        );
        expect(dates).toEqual(sorted);
    });

    it("JSON feed view preserves _extra on each item", async () => {
        const data = await callHandler(NETFLIX_TITLE_ID);
        const feed = JSON.parse(jsonView(data));
        expect(feed.items.length).toBeGreaterThan(0);
        expect(feed.items[0]._extra.platform).toBe("netflix");
    });

    it("_extra payload validates against the Zod contract", async () => {
        const data = await callHandler(NETFLIX_TITLE_ID);
        for (const item of data.item!) {
            expect(() => assertSpecExtra(item._extra)).not.toThrow();
        }
    });

    it("TMDB API key missing — throws ERR_TMDB_API_KEY_MISSING", async () => {
        delete process.env.TMDB_API_KEY;
        const { route } = await import("@/routes/spec/netflix");
        const ctx = {
            req: {
                param: (k: string) => ({ netflixTitleId: NETFLIX_TITLE_ID })[k],
            },
        } as any;
        await expect(route.handler(ctx)).rejects.toMatchObject({
            code: "ERR_TMDB_API_KEY_MISSING",
        });
    });

    it("Netflix title not found — returns empty item array", async () => {
        const { http, HttpResponse } = await import("msw");
        const { server } = await import("../../mocks/server");
        server.use(
            http.get("https://www.netflix.com/title/:netflixTitleId", () =>
                HttpResponse.text("<html><body>not found</body></html>", {
                    status: 404,
                }),
            ),
        );
        const data = await callHandler(NETFLIX_TITLE_ID);
        expect(data.item).toEqual([]);
    });
});
