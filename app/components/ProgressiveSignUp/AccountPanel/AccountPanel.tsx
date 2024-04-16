import { cx } from '@app/lib/utils';
import { MemberAuth } from '../../Auth';
import { useState } from 'preact/hooks';
import Button from '../Button';
import AccountDetails from './AccountDetails';
import PowerFlowStory from './PowerFlow/PowerFlow.story';
// import SolidComponent from './SolidComponent';

export default function AccountPanel({
  memberAuth,
  class: _class,
}: {
  memberAuth: MemberAuth;
  class?: string;
}) {
  const [tab, setTab] = useState(0);

  return (
    <div class={cx('flexsc ', _class)}>
      <div class="b-0 b-b sm:b b-slate-200 w-full max-w-screen-sm bg-slate-50 sm:rounded-md overflow-hidden">
        <div class="bg-slate-100 h-12 flex line-height-tight text-black/60 b-b b-slate-200">
          {['Account details', 'Power Flow', 'Resources usage'].map((t, i) => (
            <TabButton active={tab === i} onClick={() => setTab(i)}>
              {t}
            </TabButton>
          ))}
        </div>
        {tab === 0 ? (
          <AccountDetails memberAuth={memberAuth} />
        ) : tab == 1 ? (
          <PowerFlowStory />
        ) : (
          <ResourcesUsage />
        )}
      </div>
    </div>
  );
}

// const AccountDetails = ({ memberAuth }: { memberAuth: MemberAuth }) => {
//   return (
//     <div class="flex">
//       <div class="b-r b-slate-200 p-4">
//         <h2 class="text-lg font-semibold">Account</h2>
//         <div>{memberAuth.member.email}</div>
//         <div>Password</div>
//         <div>Subscribed to newsletter</div>
//         <div>Member tag</div>
//       </div>
//       <div class="p-4">
//         <h2 class="text-lg font-semibold">Details</h2>
//         <div>Full name</div>
//         <div>Profile image</div>

//         <div>Telegram handle</div>
//       </div>
//     </div>
//   );
// };

const MOCK_CONTRIBUTIONS = [
  ['25 Feb 2023', 25, 'USD'],
  ['25 Jan 2023', 25, 'USD'],
  ['25 Dec 2022', 25, 'USD'],
];

const PowerPledge = () => {
  return (
    <div class="text-black/60">
      <div class="flex flex-col xs:flex-row items-center py-4 px-2">
        <div class="w-60 text-center px-2">
          <div class="text-lg">Current pledge</div>
          <div class="text-3xl py-2">25 $/month</div>
          <div class="text-black/30 mb-4">Renewing on 25 Apr 2024</div>
          <Button href="https://gumroad.com">Change on Gumroad</Button>
        </div>
        <div class="flex-grow"></div>
        <div class="w-60 text-center px-2 mt-8 xs:mt-0">
          <div class="mb-4 text-lg">Membership status</div>
          <div class="b b-slate-200 p-4 bg-slate-100 rounded-md">
            <div class="text-size-[60px]">⚡️</div>
            <div class="text-size-xl">Power team</div>
          </div>
        </div>
      </div>
      <div class="p-4 text-lg">Historic contributions</div>
      {MOCK_CONTRIBUTIONS.map(([date, amount, currency], i) => (
        <div class="flex px-4 py-2 b-y b-slate-200 last:b-b-0">
          <div class="flex-grow">{date}</div>
          <div>
            {amount} {currency}
          </div>
        </div>
      ))}
    </div>
  );
};

const ResourcesUsage = () => {
  return <div class="flexcc text-2xl text-black/40 h-60">Unavailable yet</div>;
};

const TabButton = ({
  children,
  active,
  onClick,
}: {
  children: any;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      class={cx('text-center flex-grow-1 b-r b-r-slate-300 last:b-0 outline-slate-500', {
        'bg-slate-500 shadow-inset shadow-md text-white/90 pt-0.5': active,
      })}
    >
      {children}
    </button>
  );
};
