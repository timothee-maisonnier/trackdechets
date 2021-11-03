#!/usr/bin/env ts-node

import prisma from "../../prisma";

(async function main() {
  const users = await prisma.user.count();
  console.log(users);

  await prisma.$disconnect();
})();
