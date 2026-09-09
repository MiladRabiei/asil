// lib/auth/protectRoute.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ACCESS_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY_NAME ?? 'access';

export async function protectRoute(currentPath: string, redirectPath = '/auth') {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_KEY)?.value;

  if (!token) {
    const safePath = currentPath.startsWith('/') ? currentPath : '/';

    cookieStore.set('redirectAfterLogin', safePath, {
      path: '/',
      maxAge: 60 * 5,
      sameSite: 'lax',
      httpOnly: true,
    });

    redirect(redirectPath);
  }

  return token;
}
