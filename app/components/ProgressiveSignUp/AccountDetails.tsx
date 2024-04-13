import { useEffect, useState } from 'preact/hooks';
import BoltLightningIcon from '~icons/fa6-solid/bolt-lightning';
import UserIcon from '~icons/fa6-solid/user';
import { MemberAuth } from '../Auth';
import { getMember, useRemoteResource } from '@app/lib/api';
import Spinner from '../Spinner';
import TextInput from './TextInput';
import CheckboxInput from './CheckboxInput';
import { cx, gravatarUrl } from '@app/lib/utils';
import Button from './Button';
import { validate } from 'uuid';

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
  memberTag: {
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
      return new Promise<string[]>((resolve) => {
        setTimeout(() => {
          if (tag === 'foo') return resolve(['Member tag already exists']);
          resolve([]);
        }, 2000);
      });
    },
  },
  telegramHandle: {
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
    async: async (tag: string) => {
      return new Promise<string[]>((resolve) => {
        setTimeout(() => {
          if (tag === 'zequez')
            return resolve(['Telegram handle is already claimed by another member']);
          resolve([]);
        }, 2000);
      });
    },
  },
  fullName: {
    maxLength: 100,
  },
};

export default function AccountDetails({ memberAuth }: { memberAuth: MemberAuth }) {
  const { data: fullMember, error } = useRemoteResource(getMember, { id: memberAuth.member.id });

  const [submitting, setSubmitting] = useState(false);

  const [newPassword, setNewPassword] = useState('');

  const [subscribedToNewsletter, setSubscribedToNewsletter] = useState(false);

  const [telegramHandle, setTelegramHandle] = useState('');
  const [telegramHandleIsValid, setTelegramHandleIsValid] = useState(false);

  const [memberTag, setMemberTag] = useState('');
  const [memberTagIsValid, setMemberTagIsValid] = useState(false);

  const [fullName, setFullName] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');

  function formIsSubmittable() {
    if (newPassword) {
      if (!validators.password.sync(newPassword)) return false;
      if (!currentPassword) return false;
    }

    if (telegramHandle && !telegramHandleIsValid) return false;
    if (memberTag && !memberTagIsValid) return false;

    if (
      telegramHandle === (fullMember!.telegram_handle || '') &&
      memberTag === (fullMember!.tag || '') &&
      fullName === (fullMember!.full_name || '') &&
      subscribedToNewsletter === fullMember!.subscribed_to_newsletter &&
      !newPassword
    )
      return false;
    return true;
  }

  function handleSubmit() {
    if (formIsSubmittable() && !submitting) {
      setSubmitting(true);
      const update: { [key: string]: any } = {};
      if (memberTag) update['tag'] = memberTag;
      if (telegramHandle !== (fullMember!.telegram_handle || ''))
        update['telegram_handle'] = telegramHandle;
      if (fullName !== (fullMember!.full_name || '')) update['full_name'] = fullName;
      if (subscribedToNewsletter !== fullMember!.subscribed_to_newsletter)
        update['subscribed_to_newsletter'] = subscribedToNewsletter;
      if (newPassword) update['password'] = newPassword;
      if (currentPassword) update['currentPassword'] = currentPassword;

      // memberAuth.updateMember(update).then(() => {
      console.log(update);
      setSubmitting(false);
      // });
    }
  }

  useEffect(() => {
    if (fullMember) {
      setSubscribedToNewsletter(fullMember.subscribed_to_newsletter);
      setTelegramHandle(fullMember.telegram_handle || '');
      setMemberTag(fullMember.tag || '');
      setFullName(fullMember.full_name || '');
    }
  }, [fullMember]);

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
                Fulfill a Power Flow commitment and become an active member.
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
            label="Set new password"
            onChange={setNewPassword}
            validations={validators.password}
          />
          <TextInput
            class="mb-4"
            value={fullName}
            label="Full name"
            onChange={setFullName}
            validations={validators.fullName}
          />
          <TextInput
            class="mb-4"
            value={memberTag}
            validations={validators.memberTag}
            disabled={!!fullMember.tag}
            label="Member Tag"
            onChange={setMemberTag}
            onFullyValid={setMemberTagIsValid}
            loadingLabel="Checking availability"
            details="The Member Tag is used to identify your account on the collaborative editor. Additionally a subdomain is reserved for your tag name. Once set it cannot be changed."
          />

          <TextInput
            class="mb-4"
            value={telegramHandle}
            label="Telegram handle"
            validations={validators.telegramHandle}
            onFullyValid={setTelegramHandleIsValid}
            loadingLabel="Checking availability"
            onChange={setTelegramHandle}
          />
          <GravatarImage class="mb-4" email={fullMember.email} />
          <CheckboxInput
            checked={subscribedToNewsletter}
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
          <Button onClick={handleSubmit} disabled={!formIsSubmittable() || submitting}>
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
