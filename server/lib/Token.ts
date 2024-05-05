import jwt from 'jsonwebtoken';

export type AccessKeyTokenData = { siteId: string; type: 'access-key'; exp: number };
export type MemberTokenData = { memberId: string; type: 'member'; exp: number };
export type TokenData = AccessKeyTokenData | MemberTokenData;

class Token {
  generate(data: Record<string, any>, expIn = 60 * 60 * 24 * 30 * 4) {
    if (!process.env.JWT_SECRET) throw 'JWT_SECRET environment variable not set';
    const exp = Math.round(new Date().getTime() / 1000) + expIn;
    const token = jwt.sign({ ...data, exp }, process.env.JWT_SECRET);
    return token;
  }

  verifyAndGetPayload(token: string): TokenData | null {
    if (!process.env.JWT_SECRET) throw 'JWT_SECRET environment variable not set';
    let maybePayload: any;
    try {
      maybePayload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return null;
    }

    const validPayload = maybePayload ? (maybePayload as TokenData) : null;
    if (validPayload && this.validateExpiration(validPayload)) {
      return validPayload;
    } else {
      return null;
    }
  }

  validateExpiration(tokenData: { exp: number }) {
    return new Date(tokenData.exp * 1000).getTime() > new Date().getTime();
  }
}

export default new Token();
