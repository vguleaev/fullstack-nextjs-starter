## Next.js project starter

- Typescript
- eslint
- SASS
- Tailwind
- daisyUI
- Zustand
- Prisma
- NextAuth
- TRPC

### Generate Next app with command:

`npx create-next-app@latest --typescript`

Add SASS support with command:
`yarn add -D sass`

Add eslint recommended rules with command:
`yarn add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react`

Modify eslintrc.json:

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended", "plugin:react/recommended"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/self-closing-comp": [
      "error",
      {
        "component": true,
        "html": true
      }
    ]
  }
}
```

### Add DaisyUI + Tailwind

`yarn add -E tailwindcss @tailwindcss/typography postcss autoprefixer daisyui`

Create postcss.config.js:

```javascript
module.exports = {
  plugins: ['tailwindcss', 'autoprefixer'],
};
```

Create tailwind.config.js:

```javascript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
};
```

Add to globals.css:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
...
```

### Add state management

`yarn add -E zustand`

Create a store:

```typescript
// counterStore.ts
import { create } from 'zustand';

type CounterStore = {
  counter: number;
  increase: () => void;
  reset: () => void;
};

const useCounterStore = create<CounterStore>((set) => ({
  counter: 0,
  increase: () => set((state: CounterStore) => ({ counter: state.counter + 1 })),
  reset: () => set({ counter: 0 }),
}));

export { useCounterStore };
```

Use store in component:

```typescript
// counter.tsx
import { useCounterStore } from '@/stores/counterStore';

function Counter() {
  const { counter, increase, reset } = useCounterStore();

  return (
    <div className="Counter">
      <h1>count: {counter}</h1>
      <button className="btn" onClick={increase}>
        increase
      </button>
      <button className="btn" onClick={reset}>
        reset
      </button>
    </div>
  );
}

export default Counter;
```

To initialize a store with data from SSR:

```typescript
// in page call setState with data from getServerSideProps
useCounterStore.setState({ counter: props.data.id });
```

### Add Prisma

`yarn add -E -D prisma`

`npx prisma init --datasource-provider sqlite`
_(you can use "mysql" instead of sqlite or other database)_

```javascript
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider     = "sqlite" // or "mysql, etc.."
  url          = env("DATABASE_URL")
  relationMode = "prisma" // also add this
}
```

Add a new model to prisma schema:

```javascript
// schema.prisma
model User {
  id       String  @id @default(uuid())
  email    String  @unique
  name     String?
  password String
}
```

Add prisma client:
`yarn add -E @prisma/client`

**For sqlite:** Run command to create database:
`npx prisma migrate dev --name init`

Create .env file with connection string:

```
DATABASE_URL="file:./dev.db"
```

**For mysql:** Create .env file with connection string:

```
DATABASE_URL="mysql://johndoe:randompassword@localhost:3306/mydb"
```

Run db migration:
`npx prisma db push`

Create db client:

```typescript
// db/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
```

Use prisma client to create user:

```typescript
import prisma from '@/db/prisma';
//...
const user = await prisma.user.create({
  data: {
    email: 'some@mail.com',
    password: 'Password123',
  },
});
console.log('user created', user);
```

You can use Prisma UI as db browser:
`npx prisma studio`

### Add NextAuth

Install NextAuth

`yarn add -E next-auth bcrypt`

`yarn add -E -D @types/bcrypt`

Setup auth provider and callbacks:

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/db/prisma';
import { compare } from 'bcrypt';
import { DefaultSession } from 'next-auth';
import { User } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user?: User & DefaultSession['user'];
  }
}

declare module 'next-auth' {
  interface User {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials): Promise<User | null> {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        if (!email || !password) {
          throw new Error('Missing email or password');
        }

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user || !(await compare(password, user.password))) {
          throw new Error('Invalid email or password');
        }
        return user;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (session && session.user) {
        session.user.id = token.userId;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
```

Add register endpoint:

```typescript
// pages/api/auth/register.ts
import prisma from '@/db/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name, password, email } = req.body;

  if (!password || !email) {
    res.status(400).send('Missing email or password');
  }

  const exists = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (exists) {
    res.status(400).send('User already exists');
  } else {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hash(password, 10),
      },
    });
    res.status(200).json(user);
  }
}
```

Wrap whole app with SessionProvider:

```typescript
//_app.tsx
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps }: AppProps) {
  const session = pageProps.session;

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
```

Add component to login and read user from session:

```typescript
// components/auth.tsx
import { useSession, signOut, signIn, getCsrfToken } from 'next-auth/react';
import { useRouter } from 'next/router';

function Auth() {
  const { data: session } = useSession();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();

    const csrfToken = await getCsrfToken();

    const response = await signIn('credentials', {
      redirect: false,
      email: e.target.email.value,
      password: e.target.password.value,
      csrfToken,
    });

    if (response?.ok) {
      alert(`Successfully logged in!`);
      await router.push('/protected');
    } else {
      alert(response?.error);
    }
  };

  if (session && session.user) {
    return (
      <div>
        <h1 className="mb-2">Signed in as {session.user.email}</h1>
        <button className="btn" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
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
          <button className="btn btn-primary w-full max-w-xs" type="submit">
            <span className={isLoading ? 'loading loading-spinner' : ''} />
            Sign in with email
          </button>
        </div>
      </form>
    </div>
  );
}

export default Auth;
```

Note: _You need to create user from register endpoint to be able to login!_

Add next auth secret to enviroment variables:

```
// .env
NEXTAUTH_SECRET="123456789"
```

For protected route create middleware:

```typescript
// src/middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path === '/') {
    return NextResponse.next();
  }

  const session = await getToken({ req });
  if (!session && path === '/protected') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}
```

### Add TRPC

Install trpc

`yarn add -E @trpc/server @trpc/client @trpc/next @trpc/react-query @tanstack/react-query zod`

##### Add Font

Apply self hosted font as class for application wrapper:

```typescript
// pages/_app.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin', 'cyrillic'], weight: ['400', '700'] });
//...
return (
  <main className={inter.className}>
    <Component {...pageProps} />
  </main>
);
```

##### Configure vscode settings .vscode/settings.json:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true
}
```

##### Resources

- Free vector illustrations:
  https://popsy.co/illustrations
  https://undraw.co/illustrations
