import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Every page that shows someone's data. Signed-out visitors are sent to sign in.
// Server Actions post to these same paths, so they're covered too, and each
// action also checks auth() itself (src/lib/data.ts), with RLS behind that.
const isPrivateRoute = createRouteMatcher(["/dashboard(.*)", "/pokedex(.*)", "/log(.*)", "/profile(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPrivateRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
