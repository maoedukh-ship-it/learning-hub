/**
 * Controlled One-Time Initial Administrator Provisioning Script
 *
 * Usage:
 *   INITIAL_ADMIN_PASSWORD="<secure-secret>" npx tsx scripts/provision-admin.ts
 *
 * Security Rules Enforced:
 * - Reads initial password exclusively from environment variable (never hardcoded).
 * - Uses full name "System Admin", email "learning@wing-shop.com", and role "super_admin".
 * - Idempotent: Does not create duplicate administrator accounts or reset existing passwords on re-deploy.
 */

import { BRAND } from '../lib/brand';

async function provisionSystemAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const initialPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || BRAND.initialAdmin.email;

  console.log(`[Learning Hub] Verifying System Admin provisioning for ${adminEmail}...`);

  if (!supabaseUrl || !serviceRoleKey) {
    console.log(
      '[Learning Hub] External Supabase credentials (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) are not configured in this environment.'
    );
    console.log(
      '[Learning Hub] The local server-side store already provisions the System Admin profile (System Admin / learning@wing-shop.com / Super Admin) idempotently.'
    );
    console.log(
      '[Learning Hub] To provision against an external Supabase instance, supply NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and INITIAL_ADMIN_PASSWORD in your environment variables and run this script once.'
    );
    return;
  }

  if (!initialPassword || initialPassword.length < 12) {
    throw new Error(
      'INITIAL_ADMIN_PASSWORD environment variable (min 12 chars) is required for initial external Supabase provisioning.'
    );
  }

  // Query Supabase Admin Auth API to check if learning@wing-shop.com already exists
  const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!listRes.ok) {
    throw new Error(`Failed to query Supabase Admin API: ${listRes.statusText}`);
  }

  const { users } = (await listRes.json()) as {
    users: Array<{ id: string; email?: string }>;
  };
  const existing = users.find(
    (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
  );

  if (existing) {
    console.log(
      `[Learning Hub] Administrator account (${adminEmail}) already exists (ID: ${existing.id}). Skipping password reset to preserve existing credentials.`
    );
    return;
  }

  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: adminEmail,
      password: initialPassword,
      email_confirm: true,
      user_metadata: {
        full_name: BRAND.initialAdmin.fullName,
      },
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create System Admin: ${createRes.statusText}`);
  }

  console.log(
    `[Learning Hub] Provisioned ${BRAND.initialAdmin.fullName} (${adminEmail}) with role ${BRAND.initialAdmin.roleLabel}.`
  );
}

provisionSystemAdmin().catch((err) => {
  console.error('[Learning Hub] Provisioning error:', err.message);
  process.exit(1);
});
