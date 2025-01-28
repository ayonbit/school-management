import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { routesAccessMap } from "./app/lib/settings";

// Build route matchers
const matchers = Object.keys(routesAccessMap).map((route) => ({
  matcher: new RegExp(`^${route}$`),
  allowedRoles: routesAccessMap[route],
}));

export default clerkMiddleware(async (auth, req) => {
  const authResult = await auth();
  const { sessionClaims } = authResult;
  const role = sessionClaims?.metadata?.role || "";
  const url = req.url;
  if (!url) {
    console.error("Request URL is undefined", req);
    return NextResponse.next();
  }
  const parsedUrl = new URL(url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  for (const { matcher, allowedRoles } of matchers) {
    if (matcher.test(pathname) && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL(`/${role}`, url).toString());
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
