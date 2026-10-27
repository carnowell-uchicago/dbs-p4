// The one end-to-end test the assignment asks for: two users each save something, and
// neither can see the other's. If row-level security is broken, the timesheet query
// returns both users' rows, so a user would see the other's note and this test fails.
import { clerk } from "@clerk/testing/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";

function emailOf(n: 1 | 2): string {
  const email = process.env[`E2E_USER${n}_EMAIL`];
  if (!email) throw new Error(`Set E2E_USER${n}_EMAIL in .env.local`);
  return email;
}

/** A random past day (30–330 days ago, Chicago time), so runs don't collide with each other. */
function randomPastDay(): string {
  const daysAgo = 30 + Math.floor(Math.random() * 300);
  const d = new Date(Date.now() - daysAgo * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(d); // YYYY-MM-DD
}

async function signedInPage(browser: Browser, n: 1 | 2): Promise<Page> {
  const context = await browser.newContext(); // separate cookies = a separate person
  const page = await context.newPage();
  await page.goto("/"); // Clerk must load on a public page before signing in
  // Sign in by email: @clerk/testing uses CLERK_SECRET_KEY to make a one-time sign-in ticket.
  // (A password sign-in from a brand-new browser stops at Clerk's "new device" email code.)
  await clerk.signIn({ page, emailAddress: emailOf(n) });
  // Wait until Clerk has an active session (and its cookie is set) before asking the server.
  await page.waitForFunction(() => Boolean((window as unknown as { Clerk?: { session?: unknown } }).Clerk?.session));
  await page.goto("/dashboard");
  // First visit for a test user: name the trainer.
  const nameField = page.getByLabel("Trainer name");
  if (await nameField.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await nameField.fill(`E2E Trainer ${n}`);
    await page.getByRole("button", { name: "Start training" }).click();
  }
  await expect(page.getByRole("button", { name: /Clock (in|out)/ })).toBeVisible({ timeout: 20_000 });
  return page;
}

async function addManualSession(page: Page, day: string, note: string) {
  await page.getByText("+ Add time manually").click();
  await page.getByLabel("Date", { exact: true }).fill(day);
  await page.getByLabel("Start", { exact: true }).fill("10:00");
  await page.getByLabel("End", { exact: true }).fill("10:01");
  await page.getByLabel("Note (optional)").fill(note);
  await page.getByRole("button", { name: "Add time" }).click();
  await expect(page.getByText(/Added 1 min on/)).toBeVisible({ timeout: 15_000 });
}

async function openTimesheetFor(page: Page, day: string) {
  await page.goto(`/log?preset=custom&anchor=end&date=${day}&days=1`);
  await expect(page.getByRole("table")).toBeVisible({ timeout: 20_000 });
}

test("two users can't see each other's sessions", async ({ browser }) => {
  const day = randomPastDay();
  const run = Date.now().toString(36);
  const noteA = `e2e-${run}-user-A-secret`;
  const noteB = `e2e-${run}-user-B-secret`;

  // User A saves a session.
  const a = await signedInPage(browser, 1);
  await addManualSession(a, day, noteA);

  // User B saves one on the same day, same time.
  const b = await signedInPage(browser, 2);
  await addManualSession(b, day, noteB);

  // B sees their own note, and NOT A's.
  await openTimesheetFor(b, day);
  await expect(b.getByText(noteB)).toBeVisible();
  await expect(b.getByText(noteA)).toHaveCount(0);

  // A (still signed in, separate browser) sees their own, and NOT B's.
  await openTimesheetFor(a, day);
  await expect(a.getByText(noteA)).toBeVisible();
  await expect(a.getByText(noteB)).toHaveCount(0);
});
