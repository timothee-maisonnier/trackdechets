#!/usr/bin/env ts-node

import {
  createCompaniesAndAssociate,
  createUsersWithAccessToken
} from "./users";
import prisma from "../../prisma";

const USER_NUM = 20000;
const COMPANY_PER_USER = 3;

(async function main() {
  console.time("script");

  const createdUsers = await prisma.user.count();
  const userIds = await createUsersWithAccessToken(USER_NUM, {}, createdUsers);

  for (const userId of userIds) {
    await createCompaniesAndAssociate(userId, COMPANY_PER_USER);
  }
  console.timeEnd("script");
})();
