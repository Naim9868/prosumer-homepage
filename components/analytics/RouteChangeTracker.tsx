"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics/events";

/**
 * Pushes a `page_view` dataLayer event on every App Router navigation.
 *
 * - The very first render is skipped on purpose: GTM's "All Pages" trigger
 *   (which drives the Meta Pixel base tag PageView) already covers the initial
 *   document load, so no page ever reports two PageViews.
 * - A "last seen location" guard makes the component immune to React
 *   StrictMode's double-invoked effects and to re-renders with an unchanged
 *   location.
 * - Must be rendered inside a <Suspense> boundary because it uses
 *   `useSearchParams()`.
 */
export function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedLocation = useRef<string | null>(null);

  const search = searchParams.toString();

  useEffect(() => {
    const query = search ? `?${search}` : "";
    const currentLocation = `${pathname}${query}`;

    if (lastTrackedLocation.current === null) {
      lastTrackedLocation.current = currentLocation;
      return;
    }

    if (lastTrackedLocation.current === currentLocation) return;
    lastTrackedLocation.current = currentLocation;

    trackPageView({
      pathname,
      search,
      title: document.title,
    });
  }, [pathname, search]);

  return null;
}

export default RouteChangeTracker;
