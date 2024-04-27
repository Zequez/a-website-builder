import { google } from 'googleapis';

function genClientGoogleClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/_api_/auth/google/callback',
  );
}

const googleClient = genClientGoogleClient();

function googleClientForMember(tokens: { access_token: string }) {
  const newGoogleClient = genClientGoogleClient();
  console.log(tokens);
  newGoogleClient.setCredentials(tokens);
  return newGoogleClient;
}

function googleOauthForMember(tokens: { access_token: string }) {
  const memberClient = googleClientForMember(tokens);
  return google.oauth2({ auth: memberClient, version: 'v2' });
}

function googleDriveForMember(tokens: { access_token: string }) {
  const memberClient = googleClientForMember(tokens);
  return google.drive({
    version: 'v3',
    auth: memberClient,
  });
}

export { googleClient, googleOauthForMember, googleDriveForMember };
