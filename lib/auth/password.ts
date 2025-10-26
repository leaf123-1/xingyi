import bcrypt from "bcryptjs";

// 封装密码比对，便于后续切换为 Argon2 等算法
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}
