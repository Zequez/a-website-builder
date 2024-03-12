import { sha256 } from 'js-sha256';

export function gravatarUrl(email: string) {
  return `https://www.gravatar.com/avatar/${sha256(email)}?d=identicon`;
}
