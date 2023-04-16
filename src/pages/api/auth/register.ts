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
