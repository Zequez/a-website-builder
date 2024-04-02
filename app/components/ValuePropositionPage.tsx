import { useAuth } from './Auth';
import Header from './Header';
import bluePlanet2 from '../images/blue-planet-2.jpeg';
import alienShapesTalking from '../images/alien-shapes-talking.jpeg';
import { cx } from '@app/lib/utils';
import MembersExplorer from './MembersExplorer';
import PossibilitiesCloud from './PossibilitiesCloud';
import JoiningShowcase from './JoiningShowcase';
import ProgressiveSignUp from './ProgressiveSignUp';

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
  'Governance',
  'Newstletters',
];

const ValuePropositionPage = () => {
  const { memberAuth, signOut } = useAuth();

  return (
    <div class="flex flex-col bg-gray-100 text-black/80 min-h-screen">
      <div class="">
        <div class="relative h-120 overflow-hidden">
          <Header class="z-20" isAuth={!!memberAuth} signOut={signOut} />
          <div class=" relative z-20 flex space-x-8 h-80 pb-16 w-screen-md mx-auto text-white">
            <div class="flex flex-col h-full w-1/2 items-center justify-center">
              <div class="bg-black/30 p-4 rounded-md">
                <h2 class="text-2xl mb-2">
                  Get involved in an <strong>open web creation platform</strong> owned by the people
                  who use it
                </h2>
                <p class="opacity-75">
                  Hojaweb is a members-driven project that aims to bring us together in creating our
                  own web and apps with shared tools and knowledge
                </p>
              </div>
            </div>
          </div>
          <img
            src={bluePlanet2}
            class="w-full z-10 absolute top-0 left-0"
            style={{
              filter: 'brightness(250%) contrast(100%)',
            }}
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
              Join and access <strong>consulting</strong> with the core team to create{' '}
              <strong class="bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-cyan-500">
                Possibility
              </strong>{' '}
              together
            </h2>
            <p class="text-black/50">
              We are counting on your questions and requests to drive the system to where it's
              needed. Tailor-fit solutions can be made for you and unlocked for everybody.
            </p>
          </div>
        </div>
        <div class="w-screen-md mx-auto pb-16">
          <MembersExplorer />
        </div>
        <JoiningShowcase />
        <div class="flex items-center justify-center max-w-screen-md mx-auto bg-red-200 rounded-md p-2 text-white mt-4">
          <div class="bg-black/10 w-full text-center rounded-md p-2">
            Disclaimer: this sign up form is under constrution and here for getting feedback from
            peers use the one on top of the page. Looks pretty cool though.
          </div>
        </div>
        <ProgressiveSignUp />
      </div>
    </div>
  );
};

export default ValuePropositionPage;
