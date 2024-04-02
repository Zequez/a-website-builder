import { cx } from '@app/lib/utils';
import CheckCircle from '~icons/fa6-solid/circle-check';

export default function JoiningShowcase() {
  return (
    <div class="pb-16 bg-slate-200">
      <div class="max-w-screen-lg mx-auto pt-8">
        <div
          class="text-center text-[70px] font-bold mb-8 text-slate-400 tracking-wider"
          style={{
            textShadow:
              '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #fff, 0 0 50px #fff, 0 0 60px #fff, 0 0 70px #fff',
          }}
        >
          JOIN
        </div>
        <div class="flex justify-evenly text-center">
          <ValuePropositionColumn name="Visitor" icon="👤">
            <p class="mb-4 text-center  opacity-75">Use all available tools without an account</p>
            <ul class="list-disc-inside">
              <ValuePropItem>Create offline websites</ValuePropItem>
              <ValuePropItem>Export build</ValuePropItem>
            </ul>
          </ValuePropositionColumn>
          <ValuePropositionColumn name="Guest" icon="🧍">
            <p class="mb-4 text-center  opacity-75">Sign up for an account</p>
            <ul class="list-disc-inside">
              <ValuePropItem>Limited sites and files on server</ValuePropItem>
              <ValuePropItem>Deploy sites on limited domains</ValuePropItem>
              <ValuePropItem>Media files using linked Google Drive</ValuePropItem>
              <ValuePropItem>Export build web</ValuePropItem>
            </ul>
          </ValuePropositionColumn>
          <ValuePropositionColumn name="Power Team" icon="🌼">
            <p class="mb-4 text-center  opacity-75">
              Sign up for an account and pledge to pay-as-much-as-you-can monthly or yearly
              contribution
            </p>
            <ul class="list-disc-inside">
              <ValuePropItem>
                You help financing system upkeep costs and core team roles
              </ValuePropItem>
              <ValuePropItem>Unlimited sites and files on server (within reason)</ValuePropItem>
              <ValuePropItem>Deploy sites on any available domain</ValuePropItem>
              <ValuePropItem>Media files uploading using linked Google Drive</ValuePropItem>
              <ValuePropItem>Possibility consulting with core team</ValuePropItem>
              <ValuePropItem>Technical support by core team</ValuePropItem>
              <ValuePropItem>Invitation to members Telegram group</ValuePropItem>
              <ValuePropItem>Components library publishing access</ValuePropItem>
              <ValuePropItem>Invite unlimited guests to collaborate on projects</ValuePropItem>
              <ValuePropItem>
                Access to development portal for voting on features, components and templates
                proposals
              </ValuePropItem>
            </ul>
          </ValuePropositionColumn>
          <ValuePropositionColumn name="Power Team" power icon="⚡️">
            <p class="mb-4 text-center opacity-75">
              Sign up for an account and pledge more than $50 per month
            </p>
            <ul class="list-disc-inside">
              <ValuePropItem>Huge impact on the system growth</ValuePropItem>
              <ValuePropItem>All on Power Team plus...</ValuePropItem>
              <ValuePropItem>Involvement as core financer</ValuePropItem>
              <ValuePropItem>Involvement on team meetings scheduling</ValuePropItem>
              <ValuePropItem>Invitation to core team Telegram group</ValuePropItem>
            </ul>
          </ValuePropositionColumn>
        </div>
      </div>
    </div>
  );
}

const ValuePropItem = ({ children }: { children: any }) => {
  return (
    <li class="flex items-center justify-center mb-2">
      <div class="mr-2">
        <CheckCircle class="w-6" />
      </div>
      <div class="line-height-tight flex-grow">{children}</div>
    </li>
  );
};

const ValuePropositionColumn = ({
  icon,
  name,
  children,
  power = false,
}: {
  icon: string;
  name: string;
  children: any;
  power?: boolean;
}) => {
  return (
    <div class="w-1/4 border-r-[1px] border-black/10 last:border-none px-4">
      <div class="text-[60px] -mb-2">{icon}</div>
      <div
        class={cx('text-xl text-slate-500 tracking-wider mb-2', {
          'font-black bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-cyan-500':
            power,
        })}
      >
        {name}
        {power ? (
          <sup class="font-black bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-cyan-500">
            x
          </sup>
        ) : null}
      </div>
      <div class="text-left text-black/50">{children}</div>
    </div>
  );
};
