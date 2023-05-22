---
sidebarDepth: 2
---
# Script Standard

## Code Style

### General Guidelines

-   **Be consistent!**
-   Avoid using deprecated features.
-   Avoid modifying `yarn.lock` and `package.json`, unless you are adding a new dependency.
-   Conbine repetitive code into functions.
-   Prefer higher ECMAScript Standard features over lower ones.
-   Sort the entries alphabetically (uppercase first) to make it easier to find an entry.
-   Use HTTPS instead of HTTP whenever possible.
-   Use WebP format instead of JPG whenever possible since it offers better compression.

### Formatting

#### Indentation

-   Use 4 spaces for indentation for consistent and easy-to-read code.

#### Semicolons

-   Add a semicolon at the end of each statement for improved readability and consistency.

#### String

-   Use single quotes instead of double quotes whenever possible for consistency and readability.
-   Use [template literals](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals) over complex string concatenation.
-   Use [template literals](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals) for GraphQL queries as they make the code more concise and easy to read.

#### Whitespace

-   Add an empty line at the end of each file.
-   Avoid trailing whitespace for a clean and readable codebase.

### Language Features

#### Casting

-   Avoid re-casting the same type.

#### Functions

-   Prefer [arrow functions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/Arrow_functions) over the `function` keyword.

#### Loops

-   Use `for-of` instead of `for` for arrays ([javascript:S4138](https://rules.sonarsource.com/javascript/RSPEC-4138)).

#### Variables

-   Use `const` and `let` instead of `var`.
-   Declare one variable per declaration.

### Naming

-   Use `lowerCamelCase` for variables and functions to adhere to standard naming conventions.
-   Use `kebab-case` for files and folders. `snake_case` is also acceptable.
-   Use `CONSTANT_CASE` for constants.

## v2 Route Standard

When creating a new route in RSSHub, you need to organize your files in a specific way. Your namespace folder should be stored in the `lib/v2` directory and should include three mandatory files:

-   `router.js` Registers the routes
-   `maintainer.js` Provides information about the route maintainer
-   `radar.js` Provide a [RSSHub Radar](https://github.com/DIYgod/RSSHub-Radar) rule for each route

Your namespace folder structure should look like this:

```
├───lib/v2
│   ├───furstar
│       ├─── templates
│           ├─── description.art
│       ├─── router.js
│       ├─── maintainer.js
│       ├─── radar.js
│       ├─── someOtherJs.js
│   └───test
│   └───someOtherNamespaces
...
```

**All eligible routes under the `lib/v2` path will be automatically loaded without the need for updating the `lib/router.js`.**

### Namespace

RSSHub appends the name of all route namespace folders in front of the actual route. Route maintainers should think of the namespace as the root.

#### Naming Standard

-   Use the second-level domain (SLD) as your namespace. You can find more information about URL structure [here](/en/joinus/new-radar.html#top-level-object-key).
-   Do not create variations of the same namespace. For more information, see [this page](/en/joinus/new-rss/before-start.html#create-a-namespace)

### Registering a Route

To register a route, the `router.js` file should export a method that provides a `@koa/router` object when initializing the route.

### Maintainer List

The `maintainer.js` file should export an object that provides maintainer information related to the route, including:

-   Key: Corresponding path in the `@koa/router` object
-   Value: Array of string, including all maintainers' GitHub ID.

To generate a list of maintainers, use the following command: `pnpm run build:maintainer`, which will create the list under `assets/build/`.

::: danger Warning
The path in the `@koa/router` object should be the same as the `path` in the corresponding documentation before the namespace appended in front of it.
:::

### Radar Rules

All routes are required to include the `radar.js` file, which includes the corresponding domain name. The minimum requirement for a successful match is for the rule to show up on the corresponding site which requires filling in the `title` and `docs` fields.

To generate a complete `radar-rules.js` file, use the following command: `yarn build:radar`, which will create the file under `assets/build/`.

::: tip Tips
Remember to remove all build artifacts in `assets/build/` before committing.
:::

### Rendering Templates

When rendering custom content with HTML, such as `item.description`, using [art-template](https://aui.github.io/art-template/) for layout is mandatory.

All templates should be placed in the namespace's `templates` folder with the `.art` file extension.

#### Example

Here's an example taken from the [furstar](https://github.com/DIYgod/RSSHub/blob/master/lib/v2/furstar) namespace:

```html
<div>
    <img src="{{ avatar }}" />
    {{ if link !== null }}
    <a href="{{ link }}">{{name}}</a>
    {{ else }}
    <a href="#">{{name}}</a>
    {{ /if }}
</div>
```

```js
const path = require('path');
const { art } = require('@/utils/render');
const renderAuthor = (author) => art(path.join(__dirname, 'templates/author.art'), author);
```

### v1 Route Standard

::: danger Warning

The v1 Route Standard is deprecated. All new routes should be following the [v2 Route Standard](/en/joinus/script-standard.html#v2-route-standard).

:::
