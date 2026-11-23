import { ErrorCodes } from '$lib/domain/errors';
import { fail, type Actions } from '@sveltejs/kit';
import { createDb } from '$lib/server/db';
import { createUser } from '$lib/server/auth';
import { canCreateAccount } from '$lib/domain/authz';
import type { Role } from '$lib/domain/roles';

export const actions: Actions = {
  create: async ({ request, locals, platform }) => {
    if (!locals.user || !canCreateAccount(locals.user.role)) {
      return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    }

    const dbBinding = platform?.env?.DB;
    if (!dbBinding) {
      return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });
    }

    const data = await request.formData();
    const role = String(data.get('role') ?? '') as Role;
    const email = String(data.get('email') ?? '').trim();
    const name = String(data.get('name') ?? '').trim() || null;
    const selfPayer = data.get('selfPayer') === 'on';
    const password = String(data.get('password') ?? '') || undefined;

    if (role !== 'learner' && role !== 'tutor') {
      return fail(400, { error: ErrorCodes.ROLE_INVALID });
    }
    if (!email) {
      return fail(400, { error: ErrorCodes.EMAIL_REQUIRED });
    }

    const db = createDb(dbBinding);
    await createUser(db, { role, email, name, selfPayer, password });

    return { ok: true };
  },
};
