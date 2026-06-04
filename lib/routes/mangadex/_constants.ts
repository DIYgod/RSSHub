/**
 * Define constants for the MangaDex.
 */
export default {
    API: {
        /**
         * Base URL for the MangaDex API.
         *
         */
        BASE: 'https://api.mangadex.org',

        /**
         * Base URL for the fetching the manga details.
         *
         * @usage https://api.mangadex.org/manga/:id
         * @see https://api.mangadex.org/docs/redoc.html#tag/Manga/operation/get-manga-id
         * @usage https://api.mangadex.org/manga/:id/feed
         * @see https://api.mangadex.org/docs/redoc.html#tag/Manga/operation/get-manga-id-feed
         */
        MANGA_META: 'https://api.mangadex.org/manga/',

        /**
         * Base URL for a specific chapter in MangaDex Reading page.
         *
         * @usage https://api.mangadex.org/chapter/:chapterId
         * @see https://api.mangadex.org/docs/redoc.html#tag/Chapter/operation/get-chapter-id
         */
        MANGA_CHAPTERS: 'https://mangadex.org/chapter/',

        /**
         * Base URL for fetching the manga cover details.
         *
         * @usage https://api.mangadex.org/cover/:coverId
         * @usage https://api.mangadex.org/cover/?manga[]=:mangaId
         * @see https://api.mangadex.org/docs/swagger.html#/Cover/get-cover
         */
        COVERS: 'https://api.mangadex.org/cover/',

        /**
         * Base URL to retrieve the cover image.
         *
         * @usage https://uploads.mangadex.org/covers/:manga-id/:cover-filename
         * @usage https://uploads.mangadex.org/covers/:manga-id/:cover-filename.{256, 512}.jpg
         * @see https://api.mangadex.org/docs/03-manga/covers/
         */
        COVER_IMAGE: 'https://uploads.mangadex.org/covers/',

        /**
         * Get all Manga reading status for logged User
         *
         * @usage https://api.mangadex.org/manga/status
         * @note Requires authentication
         * @see https://api.mangadex.org/docs/redoc.html#tag/Manga/operation/get-manga-status
         */
        READING_STATUSES: 'https://api.mangadex.org/manga/status',

        /**
         * Retrieve a token for accessing the MangaDex API.
         *
         * @note Need configuration
         * @see https://api.mangadex.org/docs/02-authentication/personal-clients/
         */
        TOKEN: 'https://auth.mangadex.org/realms/mangadex/protocol/openid-connect/token',

        /**
         * Retrieve the user settings from MangaDex API.
         *
         * @note Requires authentication
         * @see https://api.mangadex.org/docs/redoc.html#tag/Settings/operation/get-settings
         */
        SETTING: 'https://api.mangadex.org/settings',
    },

    TOKEN_EXPIRE: 15 * 60 - 10, // access token expires in 15 minutes, refresh 10 seconds earlier
};
