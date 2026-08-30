import { test, expect } from "@playwright/test";

test("admin approves a pending enrollment", async ({ page }) => {
  await page.goto("/dashboard");

  // The dashboard heading text comes from M9's InstructorDashboardComponent template
  // ("Instructor Command Center"); the spec's regex matches that exactly so a future
  // copy edit doesn't silently break the auth-setup handoff.
  await expect(page.getByRole("heading", { name: /command center/i })).toBeVisible();

  // M9's EnrollmentListComponent renders a per-row "Approve" button only when the
  // enrollment is still Pending. We click the first one and assert the optimistic
  // status flip from M9's EnrollmentStore shows up in the row's badge.
  const firstApprove = page.getByRole("button", { name: "Approve" }).first();

  // Wait for button to be visible and enabled
  await expect(firstApprove).toBeVisible();
  await expect(firstApprove).toBeEnabled();

  await firstApprove.click();

  // The row's status badge flips to "Approved" instantly; no navigation needed.
  await expect(page.getByText("Approved").first()).toBeVisible();
});

test("pending enrollment card displays correctly", async ({ page }) => {
  await page.goto("/dashboard");

  // Verify we're on the dashboard
  await expect(page.getByRole("heading", { name: /command center/i })).toBeVisible();

  // Look for pending enrollments (they should have an Approve button)
  const approveButtons = page.getByRole("button", { name: "Approve" });
  const count = await approveButtons.count();

  // There should be at least one pending enrollment
  expect(count).toBeGreaterThan(0);

  // Verify pending status is visible
  await expect(page.getByText("Pending")).first().toBeVisible();
});

test("enrollment list loads on dashboard", async ({ page }) => {
  await page.goto("/dashboard");

  // Verify we're authenticated and on the dashboard
  await expect(page.getByRole("heading", { name: /command center/i })).toBeVisible();

  // Look for enrollment-related content (either "Pending" or "Approved" status)
  const enrollmentElements = page.locator("text=/Pending|Approved|Rejected/");
  const count = await enrollmentElements.count();

  // There should be enrollments displayed
  expect(count).toBeGreaterThan(0);
});
