import React from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Protected() {
  const { data: session } = useSession();
  return (
    <div className="flex justify-center text-center m-5">
      <div>
        <p className="mb-2">Hello {session?.user?.name}!</p>
        <p>This is a protected route. You can access it only being logged in.</p>
        <button className="btn w-36 mt-2" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    </div>
  );
}
