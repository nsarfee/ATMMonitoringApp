'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const VALID_USERS: Record<string, string> = {
  admin:   'bop@2026',
  noc:     'noc1234',
  manager: 'manager@bop',
};

const SESSION_COOKIE = 'bop_session';
const SESSION_VALUE  = 'authenticated';

export async function loginAction(username: string, password: string) {
  const expected = VALID_USERS[username.trim().toLowerCase()];
  if (!expected || expected !== password) {
    return { error: 'Invalid username or password.' };
  }
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });
  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/login');
}
