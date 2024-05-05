import { describe, it, expect } from 'vitest';
import { T } from '@db';
import { verifyToken, randomEmail, generateToken, hashCompare } from '@server/lib/utils';
import { post, put, delete_, get, patch, fixtures as F } from '@server/test/utils';

const signUpWith = (body: any) => post('auth/signUp', body);
const signInWith = (body: any) => post('auth/signIn', body);

describe('/signUp', () => {
  it('should create new user', async () => {
    const res = await signUpWith({
      email: randomEmail(),
      password: '123456',
    });

    expect(res.status).toBe(201);
    const newMember = await res.json();
    expect(T.members.get(newMember.id)).toBeTruthy();
  });

  it('should not create a new user with the same email', async () => {
    const email = randomEmail();
    const res1 = await post('auth/signUp', {
      email,
      password: '123456',
    });

    expect(res1.status).toBe(201);

    const res2 = await signUpWith({
      email,
      password: '123456',
    });

    expect(res2.status).toBe(409);
  });

  it('should not create a user with an invalid email', async () => {
    const res1 = await signUpWith({
      email: 'arsarras',
      password: '123456',
      fullName: 'a',
    });

    expect(res1.status).toBe(400);
  });

  it('should return the member and a JWT token that expires in 30 days', async () => {
    const email = randomEmail();
    const res = await signUpWith({
      email,
      password: '123456',
      fullName: 'a',
    });
    const { member, token } = await res.json();
    expect(member.email).toBe(email);
    expect(token).toBeTruthy();
    expect(token.split('.').length).toBe(3);

    const exp = new Date(JSON.parse(atob(token.split('.')[1])).exp * 1000);
    expect(exp.getTime() > new Date(60 * 60 * 24 * 29).getTime()).toBeTruthy();
  });
});

describe('/signIn', () => {
  it('should return a JWT token and member data with correct credentials', async () => {
    const email = randomEmail();
    const res1 = await signUpWith({
      email,
      password: '123456',
      fullName: 'a',
    });
    expect(res1.status).toBe(201);

    const res2 = await signInWith({ email, passphrase: '123456' });
    expect(res2.status).toBe(200);

    const { member, token } = await res2.json();
    expect(token).toBeTruthy();
    expect(token.split('.').length).toBe(3);
    expect(verifyToken(token)).toBeTruthy();
    expect(member.email).toBe(email);
  });

  it('should not return a token with inexistant account', async () => {
    const res2 = await signInWith({ email: 'arsarsarsnareinoasrt@ars.ars', passphrase: '123455' });
    expect(res2.status).toBe(401);
  });

  it('should not return a token with incorrect passphrase', async () => {
    const email = randomEmail();
    const res1 = await signUpWith({
      email,
      password: '123456',
      fullName: 'a',
    });
    expect(res1.status).toBe(201);

    const res2 = await signInWith({ email, passphrase: '123455' });
    expect(res2.status).toBe(401);
  });
});

describe('/me', () => {
  it('should return the current user', async () => {
    const email = randomEmail();
    const res1 = await signUpWith({
      email,
      password: '123456',
      fullName: 'a',
    });
    expect(res1.status).toBe(201);
    const token = (await res1.json()).token;
    const res2 = await get('auth/me', token);
    expect(res2.status).toBe(200);
    const { member } = await res2.json();
    expect(member.email).toBe(email);
    expect(member.id).toBeTruthy();
  });

  it('should return unauthorized without a token', async () => {
    const res = await get('auth/me');
    expect(res.status).toBe(401);
  });

  it('should not return passphrase', async () => {
    const email = randomEmail();
    const res1 = await signUpWith({
      email,
      password: '123456',
      fullName: 'a',
    });
    expect(res1.status).toBe(201);
    const token = (await res1.json()).token;
    const res2 = await get('auth/me', token);
    const { member } = await res2.json();
    expect(member.email).toBe(email);
    expect(member.password).toBeUndefined();
  });

  it('should return unauthorized with an expired token', async () => {
    const expiredToken = generateToken(
      {
        id: 123,
        email: 'a@b.com',
        fullName: 'a',
      },
      -1,
    );

    const res = await get('auth/me', expiredToken);
    expect(res.status).toBe(401);
  });
});
