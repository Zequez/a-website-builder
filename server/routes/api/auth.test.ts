import { describe, it, expect } from 'vitest';
import { T } from '@db';
import { verifyToken, randomEmail, generateToken, hashCompare } from '@server/lib/utils';
import { fetchApi, signUpWith, signInWith } from '@server/test/utils';

describe('/signUp', () => {
  it('should create new user', async () => {
    const membersBefore = await T.members.all();

    const res = await signUpWith({
      email: randomEmail(),
      passphrase: '123456',
      fullName: 'a',
    });

    expect(res.status).toBe(201);

    const membersAfter = await T.members.all();

    expect(membersAfter.length).toBe(membersBefore.length + 1);
  });

  it('should not create a new user with the same email', async () => {
    const email = randomEmail();
    const res1 = await signUpWith({
      email,
      passphrase: '123456',
      fullName: 'a',
    });

    expect(res1.status).toBe(201);

    const res2 = await signUpWith({
      email,
      passphrase: '123456',
      fullName: 'a',
    });

    expect(res2.status).toBe(409);
  });

  it('should not create a user with an invalid email', async () => {
    const res1 = await signUpWith({
      email: 'arsarras',
      passphrase: '123456',
      fullName: 'a',
    });

    expect(res1.status).toBe(400);
  });

  it('should not create a user without a full name', async () => {
    const res1 = await signUpWith({
      email: randomEmail(),
      passphrase: '123456',
    });

    expect(res1.status).toBe(400);
  });

  it('should return the member and a JWT token that expires in 30 days', async () => {
    const email = randomEmail();
    const res = await signUpWith({
      email,
      passphrase: '123456',
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
      passphrase: '123456',
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
      passphrase: '123456',
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
      passphrase: '123456',
      fullName: 'a',
    });
    expect(res1.status).toBe(201);
    const token = (await res1.json()).token;
    const res2 = await fetchApi('auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res2.status).toBe(200);
    const { member } = await res2.json();
    expect(member.email).toBe(email);
    expect(member.id).toBeTruthy();
  });

  it('should return unauthorized without a token', async () => {
    const res = await fetchApi('auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(res.status).toBe(401);
  });

  it('should not return passphrase', async () => {
    const email = randomEmail();
    const res1 = await signUpWith({
      email,
      passphrase: '123456',
      fullName: 'a',
    });
    expect(res1.status).toBe(201);
    const token = (await res1.json()).token;
    const res2 = await fetchApi('auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const { member } = await res2.json();
    expect(member.email).toBe(email);
    expect(member.passphrase).toBeUndefined();
  });

  it('should return unauthorized with an expired token', async () => {
    const expiredToken = await generateToken(
      {
        id: 123,
        email: 'a@b.com',
        fullName: 'a',
      },
      -1,
    );

    const res = await fetchApi('auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${expiredToken}`,
      },
    });
    expect(res.status).toBe(401);
  });
});

describe('/changePass', () => {
  it('should change password if correct credentials', async () => {
    const email = randomEmail();
    const res1 = await signUpWith({
      email,
      passphrase: '123456',
      fullName: 'a',
    });
    expect(res1.status).toBe(201);
    const { token, member } = await res1.json();
    const res2 = await fetchApi('auth/changePass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassphrase: '123456',
        newPassphrase: '1234567',
      }),
    });
    expect(res2.status).toBe(200);
    const updatedMember = await T.members.get(member.id);
    expect(await hashCompare('1234567', updatedMember.passphrase)).toBeTruthy();
  });

  it('should not change password if incorrect correct credentials', async () => {
    const email = randomEmail();
    const res1 = await signUpWith({
      email,
      passphrase: '123456',
      fullName: 'a',
    });
    expect(res1.status).toBe(201);
    const { token, member } = await res1.json();
    const res2 = await fetchApi('auth/changePass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassphrase: '123',
        newPassphrase: '123457',
      }),
    });
    expect(res2.status).toBe(400);
  });
});
