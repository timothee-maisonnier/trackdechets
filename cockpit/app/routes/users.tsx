import { Outlet } from "@remix-run/react";

export default function UsersRoute() {
  return (
    <div>
      <h1>Users</h1>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
