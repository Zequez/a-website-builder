import * as api from '@app/lib/api';
import { cx, gravatarUrl, strToHue } from '@app/lib/utils';
import { SanitizedMember } from '@db';
import { useEffect, useState } from 'preact/hooks';
import TelegramIcon from '~icons/fa6-brands/telegram';
import Spinner from './Spinner';
import { useLocale } from '@app/lib/useLocale';

const CORE_TEAM = [
  {
    tag: 'ezequiel',
    name: 'Ezequiel Schwartzman',
    roles: [
      'System Admin',
      'Research & Development',
      'Design',
      'UX',
      'Possibilities Consulting',
      'Funds Admin',
      'Ambassador',
    ],
    website: 'https://ezequiel.hoja.ar',
    telegram: 'zequez',
    profileSrc: gravatarUrl('zequez@gmail.com'),
    hoursCommitment: 20,
  },
];

const i18n = {
  en: {
    coreTeam: 'Core Team',
    powerTeam: 'Power Team',
    guests: 'Guests',
  },
  es: {
    coreTeam: 'Equipo Núcleo',
    powerTeam: 'Equipo Potenciador',
    guests: 'Invitados',
  },
};

export default function MembersExplorer({ class: _class }: { class?: string }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const { t } = useLocale(i18n);

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
    <div
      class={cx(
        'flex flex-col w-full md:rounded-md overflow-hidden bg-slate-300 border-2 border-transparent border-b-black/10',
        _class,
      )}
    >
      <div class="h-12 flex bg-gradient-to-b from-slate-200 to-slate-100 border-b-2 border-slate-200 ">
        <div class="flex space-x-[1px] pr-[1px] bg-slate-300 line-height-tight text-sm sm:text-base">
          {[t('coreTeam'), t('powerTeam'), t('guests')].map((text, i) => (
            <button
              class={cx(
                'text-center flex items-center px-4 border-solid font-light tracking-wider font-semibold',
                {
                  'border-2 border-b-0 bg-slate-500 shadow-md shadow-inset text-white/90 border-black/20 pt-0.5 text-shadow-1':
                    i === selectedTab,
                  'border-2 border-white/10 border-b-0 text-black/60 bg-gradient-to-b from-slate-200 to-slate-300 hover:to-slate-200':
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
            <MemberRow {...CORE_TEAM[0]} />
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
                  tag={m.tag}
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
        ) : (
          <div class="flexcc h-full text-4xl text-slate-4">Be the first</div>
        )}
      </div>
    </div>
  );
}

const MemberRow = ({
  tag,
  name,
  roles,
  website,
  telegram,
  profileSrc,
  hoursCommitment,
}: {
  tag: string | null;
  name: string | null;
  roles: string[];
  website: string;
  telegram: string;
  profileSrc: string;
  hoursCommitment: number;
}) => {
  return name ? (
    <div class="flex flex-col pt-2  bg-slate-100 border-b border-black/20 text-black/70">
      <div class="flex mb-2 px-2">
        <div class="mr-4 flex-shrink-0">
          <img class="h-20 w-20 rounded-full shadow-sm" src={profileSrc} />
        </div>
        <div class="flexcs flex-grow overflow-hidden">
          <div>
            <div class=" text-lg tracking-wider">
              {name}{' '}
              {tag ? <span class="bg-sky-200  text-black/40 p-1 rounded-md">@{tag}</span> : null}
            </div>
            <div class="flex flex-grow flex-shrink-0 space-x-2">
              {telegram ? (
                <a
                  class="flexcc group hover:text-sky-5 underline underline-sky-2"
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
                  target="_blank"
                  class="font-mono text-black/30 hover:text-sky-5 underline underline-sky-2"
                >
                  {website.replace(/^https?:\/\//, '')}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {roles.length ? (
        <div class="bg-black/2 border-t-2 border-slate-200 px-2">
          <div class="text-center -mt-3.5 mb-4">
            <div class="inline-block px-2 rounded-md font-semibold uppercase text-white/60 bg-slate-600 border border-slate-700">
              Roles
            </div>
          </div>
          <div class="flexcc flex-wrap relative -top-0.5 ">
            {roles.map((tag) => (
              <MemberRoleTag tag={tag} />
            ))}
          </div>
          <div class="col-span-8 row-span-1 flex flex-wrap justify-end w-full">
            {hoursCommitment ? (
              <div class="text-sm flex items-center justify-end whitespace-nowrap  mb-2">
                <span class="opacity-50 mr-2">Commitment</span>
                <span class="bg-emerald-500 border border-emerald-600 text-white px-1 py-0.25 rounded-md">
                  ~{hoursCommitment}hs / week
                </span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  ) : null;
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
