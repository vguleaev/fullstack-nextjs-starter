import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AuthForm() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session && session.user) {
    return (
      <div>
        <h1 className="mb-2">Signed in as {session.user.email}</h1>
        <div className="flex flex-row flex-wrap gap-2">
          <button className="btn" onClick={() => signOut()}>
            Sign out
          </button>
          <button className="btn" onClick={() => router.push('/protected')}>
            Protected page
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="">
      <h1 className="mb-2">Not signed in</h1>
      <div className="flex flex-row flex-wrap gap-2">
        <button className="btn" onClick={() => router.push('/auth/signin')}>
          Log in
        </button>
        <button className="btn" onClick={() => router.push('/auth/signup')}>
          Sign up
        </button>
        <button className="btn" onClick={() => router.push('/protected')}>
          Protected page
        </button>
      </div>
    </div>
  );
}
