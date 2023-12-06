import bcrypt from 'bcrypt';

export const encryptPassword = (user_pass: string) => bcrypt.hash(user_pass, 8);

export const isPasswordMatch = (reqPassword: string, dbPassword: string) => bcrypt.compare(reqPassword, dbPassword);
