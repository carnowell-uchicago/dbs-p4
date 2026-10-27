import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Every page that shows someone's data. Signed-out visitors are sent to sign in.
// Server Actions post to these same paths, so they're covered too, and each
// action also checks auth() itself (src/lib/data.ts), with RLS behind that.
const isPrivateRoute = createRouteMatcher(["/dashboard(.*)", "/pokedex(.*)", "/log(.*)", "/profile(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPrivateRoute(req)) await auth.protect();

  // Signed in already? Skip the front page and go straight to the dashboard.
  // (Brand-new users land there too, where they name their trainer first.)
  if (req.nextUrl.pathname === "/") {
    const { userId } = await auth();
    if (userId) return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
