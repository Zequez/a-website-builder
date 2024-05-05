import * as bcrypt from 'bcrypt';

export async function hashPass(passphrase: string): Promise<string> {
  const saltRounds = 10;
  return new Promise((resolve) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      // Hash the password using the generated salt
      bcrypt.hash(passphrase, salt, function (err, hash) {
        // Store hash in your password database
        resolve(hash);
      });
    });
  });
}

export async function hashCompare(plainPass: string, hashedPass: string) {
  return bcrypt.compare(plainPass, hashedPass);
}
