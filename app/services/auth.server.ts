import { db } from "~/utils/db.server";
import { TLoginData } from "~/validationFunctions/login.server";
import bcypt from "bcrypt";

const login = async (loginData: TLoginData) => {
  const candidate = await db.user.findFirst({
    where: {
      login: loginData.login,
    },
  });

  if (bcypt.compareSync(loginData.password, candidate?.password)) {
    // TODO: return jwt
  }

  // TODO: return null
};

export default {};
