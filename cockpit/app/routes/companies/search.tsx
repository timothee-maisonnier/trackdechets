import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useTransition } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const clue = form.get("clue");

  const companies = await db.Company.findMany({
    where: { name: { contains: clue, mode: "insensitive" } }
  });

  return redirect("");
};

export default function Search() {
  const transition = useTransition();

  return (
    <div>
      <p>Search</p>
      <Form method="post">
        <div>
          <label>
            Name: <input type="text" name="clue" />
          </label>
        </div>

        <button
          type="submit"
          className="button"
          disabled={transition.submission}
        >
          {transition.submission ? "Searching..." : "Search"}
        </button>
      </Form>
    </div>
  );
}
