# patreon-ts

A TypeScript library for interacting with the unofficial Patreon API. Largely translated from [`gallery-dl`](https://github.com/mikf/gallery-dl/blob/7571ca967169a9a0a23bb7550340e1e7b1537774/gallery_dl/extractor/patreon.py).

You'll probably want to pass cookies on the `PatreonClient`:

```ts
const c = new PatreonClient();
c.extraHeaders = {
    Cookie: "<patreon-cookies-here>",
};

for (const page of c.postsIterator({ campaignId: '<campaign-id-here>' })) {
    for (const post of page) {
        download(post.attributes.post_file?.url);
    }
}
```
