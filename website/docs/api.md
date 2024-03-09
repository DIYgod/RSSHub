# API

:::warning

The API is under active development and is subject to change. All suggestions are welcome!

:::

RSSHub provides the following APIs:

## List of Public Routes

:::tip

This API **will not** return any routes under `lib/protected_router.ts`.

:::

Eg: [https://rsshub.app/api/routes/github](https://rsshub.app/api/routes/github)

Route: `/api/routes/:name?`

Parameters:

-   `name`, route's top level name as in [https://github.com/DIYgod/RSSHub/tree/master/lib/routes](https://github.com/DIYgod/RSSHub/tree/master/lib/routes). Optional, **returns all public routes if not specified**.

A successful request returns an HTTP status code `200 OK` with the result in JSON:

```js
{
    "status": "success",
    "data": {
        "github": {
            "routes": [
                "/github/trending/:since/:language?",
                "/github/issue/:user/:repo",
                "/github/user/followers/:user",
                "/github/stars/:user/:repo"
            ]
        }
    },
    "message": "request returned 4 routes"
}
```

If no matching results were found, the server returns only an HTTP status code `204 No Content`.
