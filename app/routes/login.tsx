import { ActionFunction, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { validateLoginData } from "@validationFunctions";
import { ZodError } from "zod";

export const action: ActionFunction = async ({ request }) => {
  const userInput = Object.fromEntries(await request.formData());

  try {
    const loginData = validateLoginData(userInput);
  } catch (e) {
    if (e instanceof ZodError) {
      return json(
        {
          success: false,
          errorType: "validation error",
          errors: e.flatten(),
        },
        { status: 400 }
      );
    } else {
      console.error(e);

      return json(undefined, {
        status: 500,
      });
    }
  }
};

export default function login() {
  const actionData = useActionData();

  return (
    <main>
      <Form action="/login" method="post">
        <input type="text" name="login" id="login" placeholder="Login" />
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
        />

        <input type="submit" value="Login" />
      </Form>
    </main>
  );
}
