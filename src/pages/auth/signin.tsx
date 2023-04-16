import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getCsrfToken } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}

export default function SignIn({ csrfToken }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await signIn('credentials', {
      redirect: false,
      csrfToken: e.target.csrfToken.value,
      email: e.target.email.value,
      password: e.target.password.value,
    });

    if (response?.ok) {
      toast.success(`Successfully logged in!`);
      await router.push('/protected');
    } else {
      toast.error(`${response?.error}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
      <div className="w-96 flex flex-col flex-auto justify-center items-center">
        <div className="mb-5">
          <Image src="/vercel.svg" alt="App Logo" width={180} height={37} priority />
        </div>
        <div className="mb-4 text-center">
          <h1 className="text-2xl tracking-tight mb-5">Welcome back</h1>
          <form onSubmit={onSubmit}>
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <input
              placeholder="Email"
              className="input input-bordered w-full max-w-xs mb-4"
              name="email"
              type="email"
              required
            />
            <input
              placeholder="Password"
              className="input input-bordered w-full max-w-xs mb-4"
              name="password"
              type="password"
              required
            />
            <div className="flex flex-row gap-3 justify-center mb-4">
              <button
                className={`btn btn-primary w-full max-w-xs ${isLoading ? 'loading' : ''}`}
                type="submit"
                disabled={isLoading}>
                Sign in with email
              </button>
            </div>
          </form>
          <Link href="/auth/signup" className="cursor-pointer underline underline-offset-4">
            Don&apos;t have an account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
