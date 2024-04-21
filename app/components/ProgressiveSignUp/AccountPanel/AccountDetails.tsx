import { useEffect, useState } from 'preact/hooks';
import BoltLightningIcon from '~icons/fa6-solid/bolt-lightning';
import UserIcon from '~icons/fa6-solid/user';
import { MemberAuth } from '@app/lib/AuthContext';
import { getAvailability, getMember, patchMember, useRemoteResource } from '@app/lib/api';
import Spinner from '../../Spinner';
import TextInput from '../TextInput';
import CheckboxInput from '../CheckboxInput';
import { cx, gravatarUrl } from '@app/lib/utils';
import Button from '../Button';
import { validate } from 'uuid';
import { RoutePatchMembersIdQuery } from '@server/routes/api/types';
import { toArr } from '@shared/utils';

const validators = {
  password: {
    sync: (password: string) => {
      if (password.length === 0) return [];
      if (password.length >= 6) {
        return [];
      } else {
        return ['Password has to be at least 6 characters'];
      }
    },
  },
  memberTag: (id: number) => ({
    maxLength: 32,
    force: (tag: string) => {
      return tag
        .toLocaleLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .replace(/__/, '_')
        .slice(0, 32);
    },
    sync: (tag: string) => {
      if (tag.length === 0) return [];
      if (tag.length >= 3) {
        if (!tag.match(/^[a-z]/)) return ['Member tag has start with a letter'];
        if (tag.match(/_$/)) return ['Member tag cannot end in an underscore'];
        return [];
      } else {
        return ['Member tag has to be between 3 and 32 characters'];
      }
    },
    async: async (tag: string) => {
      const { data } = await getAvailability({ id, tag });
      if (!data) return ['Error checking availability'];
      if (!data.tag) return ['Member tag already in use'];
      return [];
    },
  }),
  telegramHandle: (id: number) => ({
    maxLength: 32,
    force: (tag: string) => {
      return tag.replace(/[^a-z0-9A-Z_]/, '');
    },
    sync: (tag: string) => {
      if (tag.length === 0) return [];
      if (tag.length >= 5) {
        return [];
      } else {
        return ['Telegram handles are between 5 and 32 characters long'];
      }
    },
    async: async (telegram_handle: string) => {
      const { data } = await getAvailability({ id, telegram_handle });
      if (!data) return ['Error checking availability'];
      if (!data.telegram_handle) return ['Telegram handle is already claimed by another member'];
      return [];
    },
  }),
  fullName: {
    maxLength: 100,
  },
};

export default function AccountDetails({ memberAuth }: { memberAuth: MemberAuth }) {
  const {
    data: fullMember,
    error,
    setResource,
  } = useRemoteResource(getMember, { id: memberAuth.member.id }, undefined, (fullMember) => {
    if (fullMember) {
      setSubscribedToNewsletter(fullMember.subscribed_to_newsletter);
      setTelegramHandle(fullMember.telegram_handle || '');
      setMemberTag(fullMember.tag || '');
      setFullName(fullMember.full_name || '');
    }
  });

  console.log(fullMember);

  const [submitting, setSubmitting] = useState(false);

  const [newPassword, setNewPassword] = useState('');

  const [subscribedToNewsletter, setSubscribedToNewsletter] = useState(false);
  const subscribedToNewsletterTouched = fullMember
    ? subscribedToNewsletter !== fullMember.subscribed_to_newsletter
    : false;

  const [telegramHandle, setTelegramHandle] = useState('');
  const [telegramHandleIsValid, setTelegramHandleIsValid] = useState(false);
  const telegramHandleTouched = fullMember
    ? telegramHandle !== (fullMember.telegram_handle || '')
    : false;

  const [memberTag, setMemberTag] = useState('');
  const [memberTagIsValid, setMemberTagIsValid] = useState(false);
  const memberTagTouched = fullMember ? memberTag !== (fullMember.tag || '') : false;
  const canSetMemberTag = fullMember ? !fullMember.tag : false;

  const [fullName, setFullName] = useState('');
  const fullNameTouched = fullMember ? fullName !== (fullMember.full_name || '') : false;

  const [currentPassword, setCurrentPassword] = useState('');

  const [serverErrors, setServerErrors] = useState<string[]>([]);

  function formIsSubmittable() {
    if (newPassword) {
      if (!validators.password.sync(newPassword)) return false;
      if (!currentPassword) return false;
    }

    if (telegramHandleTouched && !telegramHandleIsValid) return false;
    if (canSetMemberTag && memberTagTouched && !memberTagIsValid) return false;

    if (
      !telegramHandleTouched &&
      !memberTagTouched &&
      !fullNameTouched &&
      !subscribedToNewsletterTouched &&
      !newPassword
    )
      return false;

    return true;
  }

  function generateUpdateQuery() {
    const update: RoutePatchMembersIdQuery = { id: memberAuth.member.id };
    if (canSetMemberTag && memberTagTouched && memberTagIsValid) update['tag'] = memberTag;
    if (telegramHandleTouched && telegramHandleIsValid) update['telegram_handle'] = telegramHandle;
    if (fullNameTouched) update['full_name'] = fullName;
    if (subscribedToNewsletterTouched) update['subscribed_to_newsletter'] = subscribedToNewsletter;
    if (newPassword && currentPassword) {
      update['password'] = newPassword;
      update['currentPassword'] = currentPassword;
    }
    return update;
  }

  async function handleSubmit() {
    if (formIsSubmittable() && !submitting) {
      setSubmitting(true);
      setServerErrors([]);
      const update = generateUpdateQuery();
      const { error, data: updatedMember } = await patchMember(update);
      if (error) {
        setServerErrors(toArr(error));
      } else if (updatedMember) {
        setNewPassword('');
        setResource(updatedMember);
      }
      setSubmitting(false);
      // });
    }
  }

  // const [fullName, setFullName]

  if (!fullMember) {
    return (
      <div class="h-50 flexcc">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div class="p-4">
        <div class="bg-red-400 text-white/80 p-4 rounded-md">
          <div>Error loading account information; please try again later or contact admin</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div class="p-4">
        <div class="bg-slate-500 rounded-md flex items-center text-white/80 p-4 mb-8">
          <div class="text-[48px] mr-4">
            {fullMember.active ? <BoltLightningIcon class="text-amber-400" /> : <UserIcon />}
          </div>
          <div>
            {fullMember.active ? (
              <>
                {' '}
                You are an active member. Access the &nbsp;
                <a
                  href="https://t.me/+8uKYPHV7Cg04Y2Zh"
                  class="underline text-sky-2 inline"
                  target="_blank"
                >
                  Hoja Team Telegram Group.
                </a>{' '}
              </>
            ) : (
              <>
                You have a guest account.
                <br />
                Fulfill a Power Flow commitment to become an active member and be invited to the
                members Telegram group to make requests and discuss. You will also get access to
                larger server resources quota.
              </>
            )}
          </div>
        </div>
        <div>
          <TextInput
            class="mb-4"
            disabled={true}
            value={fullMember.email}
            label="Email"
            onChange={() => {}}
          />
          <TextInput
            class="mb-4"
            value={newPassword}
            disabled={submitting}
            type="password"
            label="Set new password"
            onChange={setNewPassword}
            validations={validators.password}
          />
          <TextInput
            class="mb-4"
            value={fullName}
            disabled={submitting}
            label="Full name"
            onChange={setFullName}
            validations={validators.fullName}
          />
          <TextInput
            class="mb-4"
            value={memberTag}
            validations={validators.memberTag(fullMember.id)}
            disabled={!canSetMemberTag || submitting}
            label="Member Tag"
            onChange={setMemberTag}
            onFullyValid={setMemberTagIsValid}
            loadingLabel="Checking availability"
            details="The Member Tag is used to identify your account on the collaborative editor. Additionally a subdomain is reserved for your tag name. Once set it cannot be changed."
          />

          <TextInput
            class="mb-4"
            value={telegramHandle}
            disabled={submitting}
            label="Telegram handle"
            validations={validators.telegramHandle(fullMember.id)}
            onFullyValid={setTelegramHandleIsValid}
            loadingLabel="Checking availability"
            onChange={setTelegramHandle}
          />
          <GravatarImage class="mb-4" email={fullMember.email} />
          <CheckboxInput
            checked={subscribedToNewsletter}
            disabled={submitting}
            onChange={setSubscribedToNewsletter}
            label="Signed up for newsletter"
          />
          {newPassword ? (
            <div class="bg-amber-200/30  p-4 mb-4 rounded-md">
              <TextInput
                class=""
                type="password"
                value={currentPassword}
                label="Current password"
                onChange={setCurrentPassword}
                details="Some changes requires you to re-enter your current password"
              />
            </div>
          ) : null}
          <div class="mb-4">
            {fullMember.google ? (
              <>
                Your account is liked with Google.{' '}
                <a href="/_api_/auth/google/remove" class="underline text-sky-4">
                  Disconnect
                </a>
              </>
            ) : (
              <a href="/_api_/auth/google" class="underline text-sky-4">
                Connect to Google Account
              </a>
            )}
          </div>
          {serverErrors.length ? (
            <div class="text-red-500 mb-4">
              {serverErrors.map((error) => (
                <div>{error}</div>
              ))}
            </div>
          ) : null}
          <Button
            onClick={handleSubmit}
            disabled={!formIsSubmittable() || submitting}
            loading={submitting}
            loadingLabel="Saving..."
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}

const GravatarImage = ({ email, class: _class }: { class?: string; email: string }) => (
  <div class={cx('flex items-center', _class)}>
    <div class="mr-4">
      <img src={gravatarUrl(email)} class="h-20 w-20 rounded-full bg-white b b-slate-400" />
    </div>
    <div class="flex-grow">
      <span class="text-lg font-semibold">Profile image</span>
      <br />
      <span class="text-black/40">
        Gotten from{' '}
        <a class="underline text-sky-4" href="https://gravatar.com/">
          Gravatar
        </a>{' '}
        using your email. You can change it there.
      </span>
    </div>
  </div>
);
