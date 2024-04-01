import { useAuth } from './Auth';
import Header from './Header';
import bluePlanet from '../images/blue-planet.jpeg';
import alienShapesTalking from '../images/alien-shapes-talking.jpeg';
import { cx } from '@app/lib/utils';
import MembersExplorer from './MembersExplorer';
import PossibilitiesCloud from './PossibilitiesCloud';

const possibilities = [
  'Virtual stores',
  'Blogs',
  'Knowledge gardens',
  'Mobile apps',
  'Community boards',
  'Personal websites',
  'Art and work showcasing',
  'Mappings',
  'Local currencies',
  'Courses',
  'Experimental tools',
  'Automation systems',
  'Community tools',
  'Spreadsheets',
  'Games',
  'Neighbourhoods',
  'E-books',
  'Libraries',
];

const ValuePropositionPage = () => {
  const { memberAuth, signOut } = useAuth();

  return (
    <div class="flex flex-col bg-gray-100 text-black/80 min-h-screen">
      <Header isAuth={!!memberAuth} signOut={signOut} />
      <div class="pt-8">
        <div class="flex space-x-4 h-70 pb-16 w-screen-md mx-auto">
          <div class="flex flex-col h-full items-center justify-center">
            <h2 class="text-2xl mb-2">
              Get involved in an <strong>open web creation platform</strong> owned by the people who
              use it
            </h2>
            <p class="text-black/50">
              Hojaweb is a members-driven project that aims to bring us together in creating our own
              web and apps with shared tools and knowledge
            </p>
          </div>
          <img
            class="h-full rounded-2xl shadow-lg scale-x-[-100%]"
            src={bluePlanet}
            style={{ filter: 'brightness(250%) contrast(100%)' }}
          />
        </div>
        <PossibilitiesCloud possibilities={possibilities} />
        <div class="flex space-x-4 h-70 pb-16 w-screen-md mx-auto">
          <img
            class="h-full rounded-2xl shadow-lg"
            src={alienShapesTalking}
            style={{ filter: 'brightness(250%) contrast(100%)' }}
          />
          <div class="flex flex-col h-full items-center justify-center">
            <h2 class="text-2xl mb-2">
              Get access to <strong>consulting</strong> with the core team on technical{' '}
              <strong class="bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-cyan-500">
                possibilities
              </strong>
            </h2>
            <p class="text-black/50">
              You can ask the team any question you want, if you can imagine it, it can be
              integrated into the system and tailored to you; the web is an ever evolving sandbox,
              and once new features are unlocked, they are available to everyone
            </p>
          </div>
        </div>
        <div class="w-screen-md mx-auto pb-16">
          <MembersExplorer />
        </div>
        <div class="pb-16 bg-slate-200">
          <div class="max-w-screen-lg mx-auto pt-8">
            <div class="text-center text-[60px] font-bold mb-8 text-slate-400 tracking-wider">
              JOIN
            </div>
            <div class="flex justify-evenly text-center">
              <ValuePropositionColumn name="Unregistered">
                <ul class="list-disc-inside">
                  <li>Create offline websites</li>
                  <li>Export build</li>
                </ul>
              </ValuePropositionColumn>
              <ValuePropositionColumn name="Guest">
                <ul class="list-disc-inside">
                  <li>Limited sites and files on server</li>
                  <li>Deploy sites on limited domains</li>
                  <li>Media files using linked Google Drive</li>
                  <li>Export build web</li>
                </ul>
              </ValuePropositionColumn>
              <ValuePropositionColumn name="Power Team">
                <ul class="list-disc-inside">
                  <li>Unlimited sites and files on server (within reason)</li>
                  <li>Deploy sites on any available domain</li>
                  <li>Media files using linked Google Drive</li>
                  <li>Direct access to possibility consulting with core team</li>
                  <li>Technical support by core team</li>
                  <li>Invitation to members Telegram group</li>
                  <li>Components library publishing access</li>
                  <li>Invite unlimited guests to collaborate on projects</li>
                  <li>
                    Access to development portal for voting on features, components and templates
                    proposals
                  </li>
                </ul>
              </ValuePropositionColumn>
              <ValuePropositionColumn name="Power Team" power>
                <ul class="list-disc-inside">
                  <li>All on Power Team plus...</li>
                  <li>Involvement as core financer</li>
                  <li>Involvement on team meetings scheduling</li>
                  <li>Invitation to core team Telegram group</li>
                </ul>
              </ValuePropositionColumn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ValuePropositionColumn = ({
  name,
  children,
  power = false,
}: {
  name: string;
  children: any;
  power?: boolean;
}) => {
  return (
    <div class="w-1/4 border-r-[1px] border-black/10 last:border-none px-4">
      <div
        class={cx('text-xl text-slate-500 tracking-wider mb-4', {
          'font-black bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-cyan-500':
            power,
        })}
      >
        {name}
        {power ? (
          <sup class="font-black bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-cyan-500">
            2
          </sup>
        ) : null}
      </div>
      <div class="text-left text-black/50">{children}</div>
    </div>
  );
};

export default ValuePropositionPage;
