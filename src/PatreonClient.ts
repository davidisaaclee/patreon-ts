import {
  PostsResponseSchema,
  PostsResponse,
  CurrentUserResponse,
  CurrentUserResponseSchema,
  SinglePostResponseSchema,
} from "./types";

type QueryParamsWithCursor<Params> =
  | (Params & { cursor?: string })
  | (Partial<Params> & { cursor: string });

export class PatreonClient {
  extraHeaders: Record<string, string> = {};

  readonly #PATREON_HEADERS = {
    "User-Agent": "Patreon/72.2.28 (Android; Android 14; Scale/2.10)",
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    Referer: "https://www.patreon.com/",
    "Content-Type": "application/vnd.api+json",
  };

  get #headers() {
    return {
      ...this.#PATREON_HEADERS,
      ...this.extraHeaders,
    };
  }

  #buildUrl(endpoint: string, cursor?: string): URL {
    const url = new URL(`https://www.patreon.com/api/${endpoint}`);

    url.searchParams.set(
      "include",
      [
        "campaign",
        "access_rules",
        "attachments",
        "attachments_media",
        "audio",
        "images",
        "media",
        "native_video_insights",
        "poll.choices",
        "poll.current_user_responses.user",
        "poll.current_user_responses.choice",
        "poll.current_user_responses.poll",
        "user",
        "user_defined_tags",
        "ti_checks",
      ].join(","),
    );

    url.searchParams.set(
      "fields[campaign]",
      [
        "currency",
        "show_audio_post_download_links",
        "avatar_photo_url",
        "avatar_photo_image_urls",
        "earnings_visibility",
        "is_nsfw",
        "is_monthly",
        "name",
        "url",
      ].join(","),
    );

    url.searchParams.set(
      "fields[post]",
      [
        "change_visibility_at",
        "comment_count",
        "commenter_count",
        "content",
        "current_user_can_comment",
        "current_user_can_delete",
        "current_user_can_view",
        "current_user_has_liked",
        "embed",
        "image",
        "insights_last_updated_at",
        "is_paid",
        "like_count",
        "meta_image_url",
        "min_cents_pledged_to_view",
        "post_file",
        "post_metadata",
        "published_at",
        "patreon_url",
        "post_type",
        "pledge_url",
        "preview_asset_type",
        "thumbnail",
        "thumbnail_url",
        "teaser_text",
        "title",
        "upgrade_url",
        "url",
        "was_posted_by_campaign_owner",
        "has_ti_violation",
        "moderation_status",
        "post_level_suspension_removal_date",
        "pls_one_liners_by_category",
        "video_preview",
        "view_count",
      ].join(","),
    );

    url.searchParams.set("fields[post_tag]", ["tag_type", "value"].join(","));
    url.searchParams.set(
      "fields[user]",
      ["image_url", "full_name", "url"].join(","),
    );
    url.searchParams.set(
      "fields[access_rule]",
      ["access_rule_type", "amount_cents"].join(","),
    );
    url.searchParams.set(
      "fields[media]",
      ["id", "image_urls", "download_url", "metadata", "file_name"].join(","),
    );
    url.searchParams.set(
      "fields[native_video_insights]",
      [
        "average_view_duration",
        "average_view_pct",
        "has_preview",
        "id",
        "last_updated_at",
        "num_views",
        "preview_views",
        "video_duration",
      ].join(","),
    );
    url.searchParams.set("filter[contains_exclusive_posts]", "true");
    url.searchParams.set("filter[is_draft]", "false");

    url.searchParams.set("page[cursor]", cursor ?? "");

    url.searchParams.append("json-api-version", "1.0");

    return url;
  }

  #setCampaignIdFilter(url: URL, campaignId: string) {
    url.searchParams.set("filter[campaign_id]", campaignId);
  }

  #setCollectionIdFilter(url: URL, collectionId: string) {
    url.searchParams.set("filter[collection_id]", collectionId);
  }

  async posts(
    opts: QueryParamsWithCursor<{
      campaignId: string;
      collectionId?: string;
      sort?: `${"" | "-"}published_at`;
    }>,
  ): Promise<PostsResponse> {
    const { campaignId, collectionId, sort = "-published_at", cursor } = opts;
    const url = this.#buildUrl("posts", cursor);
    if (campaignId) {
      this.#setCampaignIdFilter(url, campaignId);
    }
    if (collectionId) {
      this.#setCollectionIdFilter(url, collectionId);
    }
    url.searchParams.set("sort", sort);

    const res = await fetch(url.toString(), {
      headers: this.#headers,
    });
    if (!res.ok) {
      throw new Error(`Error fetching posts: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    const out = await PostsResponseSchema.parse(json);
    return out;
  }

  async *postsIterator(params: {
    campaignId: string;
    collectionId?: string;
    initialCursor?: string;
  }) {
    const fetcher = (cursor?: string) =>
      this.posts({
        campaignId: params.campaignId,
        collectionId: params.collectionId,
        cursor,
      });
    yield* this.#postResponsesIterator(fetcher, params.initialCursor);
  }

  async *#postResponsesIterator(
    fetcher: (cursor?: string) => Promise<PostsResponse>,
    initialCursor?: string,
  ) {
    let cursor = initialCursor;
    while (true) {
      const page = await fetcher(cursor);
      yield { page, nextCursor: page.meta?.pagination?.cursors?.next };
      cursor = page.meta?.pagination?.cursors?.next ?? undefined;
      if (cursor == null) {
        return;
      }
    }
  }

  async *following(params: { initialCursor?: string } = {}) {
    const url = this.#buildUrl("stream");
    url.searchParams.set("filter[is_following]", "true");

    const fetcher = async (cursor?: string) => {
      const pagedUrl = new URL(url.toString());
      if (cursor) {
        pagedUrl.searchParams.set("page[cursor]", cursor);
      }
      const res = await fetch(pagedUrl.toString(), {
        headers: this.#headers,
      });
      if (!res.ok) {
        throw new Error(
          `Error fetching posts: ${res.status} ${res.statusText}`,
        );
      }
      const json = await res.json();
      const parsed = await PostsResponseSchema.parse(json);
      return parsed;
    };

    yield* this.#postResponsesIterator(fetcher, params.initialCursor);
  }

  async currentUser(): Promise<CurrentUserResponse | null> {
    const res = await fetch("https://www.patreon.com/api/current_user", {
      headers: this.#headers,
    });

    // Return null if not logged in
    if (res.status === 401) {
      return null;
    }

    const json = await res.json();
    return CurrentUserResponseSchema.parse(json);
  }

  async login(opts: {
    email: string;
    password: string;
  }): Promise<{ cookie: string; response: Response } | null> {
    const url = new URL("https://www.patreon.com/api/auth");
    url.searchParams.set("include", "user.null");
    url.searchParams.set("fields[user]", "[]");
    url.searchParams.set("json-api-version", "1.0");
    url.searchParams.set("json-api-use-default-includes", "false");

    const response = await fetch(url.toString(), {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "genericPatreonApi",
          attributes: {
            patreon_auth: {
              email: opts.email,
              password: opts.password,
              allow_account_creation: false,
            },
            auth_context: "auth",
            ru: "https://www.patreon.com/home",
          },
          relationships: {},
        },
      }),
      headers: {
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        Referer: "https://www.patreon.com/login",
        "Content-Type": "application/vnd.api+json",
      },
    });
    if (!response.ok) {
      return null;
    }
    // TODO: This includes stuff like expirations
    // Use https://www.npmjs.com/package/set-cookie-parser to parse
    const cookie = response.headers.get("set-cookie");
    if (cookie == null) {
      return null;
    }
    return { cookie, response };
  }

  async post(postId: string) {
    const url = this.#buildUrl(`posts/${postId}`);
    const res = await fetch(url.toString(), {
      headers: this.#headers,
    });
    if (!res.ok) {
      throw new Error(`Error fetching post: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    return SinglePostResponseSchema.parse(json);
  }
}

export default PatreonClient;
