import TelegramIcon from '~icons/fa6-brands/telegram';
import { useEffect, useState } from 'preact/hooks';
import { cx, gravatarUrl, strToHue } from '@app/lib/utils';
import * as api from '@app/lib/api';
import { SanitizedMember } from '@db';
import Spinner from './Spinner';

export default function MembersExplorer() {
  const [selectedTab, setSelectedTab] = useState(0);

  const [membersStatus, setMembersStatus] = useState<
    'not-started' | 'loading' | 'error' | 'loaded'
  >('not-started');
  const [members, setMembers] = useState<null | SanitizedMember[]>(null);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (selectedTab === 2 && membersStatus === 'not-started') {
      setMembersStatus('loading');
      (async () => {
        const { data: members, error } = await api.getMembers({}, null);
        if (members) {
          setMembersStatus('loaded');
          const sortedMembers = [...members].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          );
          setMembers(sortedMembers);
        } else {
          setMembersStatus('error');
          setError('Could not load members list');
        }
      })();
    }
  }, [selectedTab, membersStatus]);

  return (
    <div class="flex flex-col w-full rounded-md overflow-hidden bg-slate-300 border border-black/3">
      <div class="h-12 flex bg-slate-200 border-b border-black/15">
        <div class="flex space-x-[1px] bg-slate-600">
          {['Core Team', 'Power Team', 'Guests'].map((text, i) => (
            <button
              class={cx(
                'text-center flex items-center px-4 border-solid font-light tracking-wider text-shadow-1',
                {
                  'border bg-slate-500 shadow-md shadow-inset text-white/90 border-black/20 pt-0.5':
                    i === selectedTab,
                  'border border-transparent text-white/50 hover:text-white/90 bg-gradient-to-b from-slate-500 to-slate-600 hover:to-slate-500':
                    i !== selectedTab,
                },
              )}
              onClick={() => setSelectedTab(i)}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
      <div class="flex flex-col h-72 overflow-auto">
        {selectedTab === 0 ? (
          <>
            <MemberRow
              name="Ezequiel Schwartzman"
              roles={[
                'System Admin',
                'Research & Development',
                'Design',
                'Possibilities Consulting',
                'Funds Admin',
              ]}
              website="https://ezequiel.hojaweb.xyz"
              telegram="zequez"
              profileSrc="https://cdn1.cdn-telegram.org/file/k0E8_i5WXn6IgiArm4CEiHsao6sDyzFArgONUYY_YRDg7emWe6cVcrOxWl5K5yGMSqhKS7asuMqbObUwJ6hOcUyWOEWdPRj0mE6yjixpFKrbObOzdWYOXIA39t4m9atCXhofGTVQykyRoKZ4_KA4dW0_Nt5UI_7w9t1qtCDpu1weXlAGkUlcwYseKura88CwFFyHGgVs2X4_reKCQjNIkW5QnJCtdT93i2UctM7dM3Eel7YuV3wbkjXF2Exos6APfhcN0KfaPIV7IjHsKHuXDhBhRUgQoU6HAUocT2FF2HumvQwrdv7lzA9poEjeZDhsImsDCfjhTB4-5g1enHm3IA.jpg"
              hoursCommitment={20}
            />
          </>
        ) : selectedTab === 2 ? (
          membersStatus === 'loading' ? (
            <div class="flex items-center justify-center h-40">
              <Spinner />
            </div>
          ) : error ? (
            <div>Error loading members</div>
          ) : members ? (
            members!.map((m) =>
              m.is_admin ? null : (
                <MemberRow
                  name={m.full_name}
                  roles={[]}
                  website=""
                  telegram=""
                  profileSrc={gravatarUrl(m.email)}
                  hoursCommitment={0}
                />
              ),
            )
          ) : null
        ) : null}
      </div>
    </div>
  );
}

const MemberRow = ({
  name,
  roles,
  website,
  telegram,
  profileSrc,
  hoursCommitment,
}: {
  name: string;
  roles: string[];
  website: string;
  telegram: string;
  profileSrc: string;
  hoursCommitment: number;
}) => {
  return (
    <div class="p-2  bg-slate-100 flex border-b border-black/20">
      <div class="mr-4">
        <img class="h-20 w-20 rounded-full shadow-sm" src={profileSrc} />
      </div>
      <div class="text-black/70 flex flex-col space-y-1 flex-grow">
        <div class="text-lg tracking-wider">{name}</div>
        <div class="flex relative -top-0.5 flex-wrap">
          {roles.map((tag) => (
            <MemberRoleTag tag={tag} />
          ))}
        </div>
        <div class="flex space-x-2">
          {telegram ? (
            <a
              class="flex items-center group hover:text-sky-5 underline underline-sky-2"
              href={`https://t.me/${telegram}`}
              target="_blank"
            >
              <TelegramIcon />
              <span class="inline-block text-right w-0 group-hover:w-[72px] overflow-hidden transition-width">
                Telegram
              </span>
            </a>
          ) : null}
          {website ? (
            <a
              href={website}
              class="font-mono text-black/30 hover:text-sky-5 underline underline-sky-2"
            >
              {website.replace(/^https?:\/\//, '')}
            </a>
          ) : null}
          <div class="flex-grow"></div>
          {hoursCommitment ? (
            <div class="text-sm flex items-center">
              <span class="opacity-50 mr-2">Commitment</span>
              <span class="bg-emerald-500 border border-emerald-600 text-white px-1 py-0.25 rounded-md">
                ~{hoursCommitment}hs / week
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const MemberRoleTag = ({ tag }: { tag: string }) => {
  return (
    <span
      class="rounded-md text-white uppercase text-xs px-2 py-0.5 font-semibold border mr-1 mb-1"
      style={{
        backgroundColor: `hsl(${strToHue(tag)}, 70%, 60%)`,
        borderColor: `hsl(${strToHue(tag)}, 70%, 50%)`,
      }}
    >
      {tag}
    </span>
  );
};
