import { cookies } from 'next/headers';

export type ServerFetchOptions = RequestInit & {
  auth?: boolean;
};

export async function serverFetch(
  input: string,
  { auth = true, ...init }: ServerFetchOptions = {}
) {
  const headers = new Headers(init.headers);

  if (auth) {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${input}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw { status: res.status, body };
  }

  return res;
}
