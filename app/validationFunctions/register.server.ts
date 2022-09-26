import validator from "validator";
import z from "zod";
import { db } from "~/utils/db.server";

export type TNewUserData = {
  login: string;
  nickname: string;
  email: string;
  password: string;
};

const RegisterData = z.object({
  login: z
    .string()
    .trim()
    .min(4)
    .max(40)
    .refine(
      // prettier-ignore
      (val) => validator.isAlphanumeric(val, "en-US"),
      "Only english and numbers allowed"
    )
    .refine(async (val) => {
      const userWithLogin = await db.user.findFirst({
        where: {
          login: val,
        },
      });

      return !userWithLogin ? true : false;
    }, "Login is taken"),
  nickname: z
    .string()
    .min(4)
    .max(50)
    .refine(
      // prettier-ignore
      (val) => (/^[a-zA-Z0-9\s]*$/).test(val),
      "Only english, numbers and spaces allowed"
    )
    .refine(async (val) => {
      const userWithNickname = await db.player.findFirst({
        where: {
          nickname: val,
        },
      });

      return !userWithNickname ? true : false;
    }, "Nickname is taken"),
  email: z
    .string()
    .email()
    .min(4)
    .max(100)
    .refine(async (val) => {
      const userWithEmail = await db.user.findFirst({
        where: {
          email: val,
        },
      });

      return !userWithEmail ? true : false;
    }, "Email is taken"),
  password: z
    .string()
    .trim()
    .min(8)
    .max(40)
    .refine(
      (val) => validator.isAscii(val),
      "Only english, numbers and special chars allowed"
    )
    .refine(
      // prettier-ignore
      (val) => !(/\s/).test(val),
      "Spaces are not allowed"
    ),
});

export const validateNewUserData = async (userInput: {
  [key: string]: unknown;
}) => {
  const newUserData = await RegisterData.parseAsync(userInput);
  return newUserData as TNewUserData;
};
