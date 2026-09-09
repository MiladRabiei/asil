import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';
const SITE_NAME = 'Asil'; // matches app/layout.tsx metadata.title and app/manifest.ts — keep these three in sync
const DEFAULT_LOCALE = 'fa_IR';

type SearchParams = Record<string, string | string[] | undefined>;

interface CreateMetadataOptions {
  title: string;
  description: string;
  path?: string;
  /**
   * Explicit override. If omitted, `index` is derived automatically from
   * `searchParams` + `canonicalKeys` (see below). Set this only when you
   * want to force a value regardless of query params (e.g. a static page).
   */
  index?: boolean;
  follow?: boolean;
  keywords?: string[];
  openGraph?: Metadata['openGraph'];
  /**
   * The raw searchParams object from the page (Next.js passes this as a
   * prop to page components). Only relevant for query-param-driven pages
   * like PLP.
   */
  searchParams?: SearchParams;
  /**
   * Which keys in `searchParams` are considered "identity" for the page —
   * i.e. params that describe *what page this is* (brand, category) as
   * opposed to *how it's being viewed right now* (sort, page, color).
   * These are the only params included in the canonical URL.
   *
   * If every key present in `searchParams` is covered by `canonicalKeys`,
   * the page is treated as indexable (unless `index` is explicitly passed).
   * If any extra/non-canonical param is present (e.g. ?sort=price on top
   * of ?brand=samsung), the page is auto-noindexed since it's a filtered
   * view of a canonical page rather than the canonical page itself.
   *
   * Example: canonicalKeys: ['category', 'brand'] means
   *   /products?category=phones&brand=samsung        → canonical, indexed
   *   /products?category=phones&brand=samsung&sort=price → noindex,
   *     canonical still points at the two-param version above
   */
  canonicalKeys?: string[];
  /**
   * Use ONLY when the favicon depends on runtime data (e.g. per-tenant/
   * per-brand branding) and can't be expressed via Next's file convention
   * (app/**\/icon.png, app/**\/favicon.ico), which is the preferred approach
   * for anything static since Next handles sizes/link tags automatically.
   */
  icons?: Metadata['icons'];
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Builds a canonical query string containing only the given keys, in a
 * fixed alphabetical order, so that ?brand=x&category=y and
 * ?category=y&brand=x resolve to the identical canonical URL.
 */
function buildCanonicalQuery(searchParams: SearchParams, canonicalKeys: string[]): string {
  const pairs = canonicalKeys
    .slice()
    .sort()
    .map((key) => {
      const value = firstValue(searchParams[key]);
      return value ? ([key, value] as const) : null;
    })
    .filter((pair): pair is readonly [string, string] => pair !== null);

  if (pairs.length === 0) return '';

  const query = new URLSearchParams(pairs as [string, string][]);
  return `?${query.toString()}`;
}

/**
 * True if searchParams contains any key with a real value that is NOT in
 * canonicalKeys — meaning this is a filtered/sorted view, not the
 * canonical page itself.
 */
function hasNonCanonicalParams(searchParams: SearchParams, canonicalKeys: string[]): boolean {
  return Object.keys(searchParams).some((key) => {
    if (canonicalKeys.includes(key)) return false;
    const value = firstValue(searchParams[key]);
    return value !== undefined && value !== '';
  });
}

/**
 * Normalizes a path to always start with a single leading slash and never
 * have a trailing slash (except for the root path itself). This prevents
 * `/products` and `/products/` from producing two different canonical URLs
 * for what should be treated as the same page.
 */
function normalizePath(path: string): string {
  if (!path) return '';

  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  const withoutTrailingSlash =
    withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')
      ? withLeadingSlash.slice(0, -1)
      : withLeadingSlash;

  return withoutTrailingSlash;
}

export function createMetadata({
  title,
  description,
  path = '',
  index,
  follow = true,
  keywords,
  openGraph,
  searchParams,
  canonicalKeys = [],
  icons,
}: CreateMetadataOptions): Metadata {
  const basePath = normalizePath(path);

  // If searchParams were provided, append only the canonical-significant
  // ones to the canonical URL (sorted, so key order never matters).
  const canonicalQuery = searchParams ? buildCanonicalQuery(searchParams, canonicalKeys) : '';
  const canonical = `${SITE_URL}${basePath}${canonicalQuery}`;

  // Resolve index: explicit prop wins. Otherwise, if searchParams were
  // given, auto-noindex when a non-canonical param is present (a filtered/
  // sorted view). Otherwise default to indexable.
  const resolvedIndex =
    index !== undefined
      ? index
      : searchParams
        ? !hasNonCanonicalParams(searchParams, canonicalKeys)
        : true;

  return {
    title,
    description,
    keywords,
    robots: {
      index: resolvedIndex,
      follow,
      googleBot: {
        index: resolvedIndex,
        follow,
        // Allow full-size image previews and untruncated snippets in
        // search results when the page is indexable. These are ignored
        // by Google when index is false, but harmless to include either way.
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical,
    },
    // Only set when explicitly passed — omitting the key entirely (rather
    // than passing undefined) lets Next's file-convention favicon
    // (app/**/icon.png) keep working for any route that doesn't need a
    // dynamic one.
    ...(icons ? { icons } : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: DEFAULT_LOCALE,
      type: 'website',
      // Caller-provided openGraph overrides the defaults above (e.g. to set
      // images, or type: 'product' for PDP pages) without needing to repeat
      // title/description/url/siteName/locale every time.
      ...openGraph,
    },
  };
}
