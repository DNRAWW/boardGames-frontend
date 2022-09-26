import { ZodError } from "zod";
import { ActionFunction, json, redirect } from "@remix-run/node";
import { validateNewUserData } from "@validationFunctions";
import { Form, useActionData } from "@remix-run/react";
import { UserServices } from "@services";

export const action: ActionFunction = async ({ request }) => {
  const userInput = Object.fromEntries(await request.formData());

  try {
    const newUserData = await validateNewUserData(userInput);

    await UserServices.createNewUser(newUserData);

    return redirect("/login");
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

export default function register() {
  const actionData = useActionData();

  return (
    <main>
      <Form action="/register" method="post">
        <input type="text" name="login" id="login" placeholder="Login" />
        <input
          type="text"
          name="nickname"
          id="nickname"
          placeholder="Nickname"
        />
        <input
          type="email"
          name="email"
          id="email"
          placeholder="example@gmail.com"
        />
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
        />
        <input
          type="password"
          name="password2"
          id="password2"
          placeholder="Repeat password"
        />
        <input type="submit" value="Sign up" />
      </Form>
    </main>
  );
}
