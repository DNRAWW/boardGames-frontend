import z from "zod";

export type TLoginData = {
  login: string;
  password: string;
};

const LoginData = z.object({
  login: z.string().trim().min(4).max(40),
  password: z.string().trim().min(8).max(40),
});

export const validateLoginData = (userInput: { [key: string]: unknown }) => {
  const loginData = LoginData.parse(userInput);
  return loginData as TLoginData;
};
