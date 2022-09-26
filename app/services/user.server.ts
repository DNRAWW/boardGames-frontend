import { db } from "~/utils/db.server";
import { TNewUserData } from "~/validationFunctions/register.server";
import bcrypt from "bcrypt";

const createNewUser = async (newUserData: TNewUserData) => {
  const hashedPasword = await bcrypt.hash(newUserData.password, 3);

  const newUser = await db.user.create({
    data: {
      email: newUserData.email,
      login: newUserData.login,
      password: hashedPasword,
    },
  });

  await db.player.create({
    data: {
      userId: newUser.id,
      nickname: newUserData.nickname,
    },
  });
};

export default { createNewUser };
