import type { ReactNode } from 'react';

type ComponentProps = {
  children: ReactNode;
};

export default function Layout({ children }: ComponentProps) {
  return <div>{children}</div>;
}
