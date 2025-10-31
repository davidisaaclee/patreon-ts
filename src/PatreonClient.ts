import { PostsResponseSchema, PostsResponse } from "./types";

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
      headers: {
        ...this.#PATREON_HEADERS,
        ...this.extraHeaders,
      },
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
    let cursor = params.initialCursor;
    while (true) {
      const page = await this.posts({
        campaignId: params.campaignId,
        collectionId: params.collectionId,
        cursor,
      });
      yield page.data;
      cursor = page.meta?.pagination?.cursors?.next ?? undefined;
      if (cursor == null) {
        return;
      }
    }
  }
}

export default PatreonClient;
