import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Auth() {
  const router = useRouter();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
      <div className="w-96 flex flex-col flex-auto justify-center items-center">
        <div className="mb-5">
          <Image src="/vercel.svg" alt="App Logo" width={180} height={37} priority />
        </div>
        <div className="mb-2 text-center">Welcome to MyApp</div>
        <div className="mb-4 text-center">Log in with your account to continue</div>
        <div className="flex flex-row gap-3">
          <button className="btn relative btn-primary" onClick={() => router.push('/auth/signin')}>
            <div className="flex w-full items-center justify-center gap-2">Log In</div>
          </button>
          <button className="btn relative btn-primary" onClick={() => router.push('/auth/signup')}>
            <div className="flex w-full items-center justify-center gap-2">Sign Up</div>
          </button>
        </div>
      </div>
    </div>
  );
}
