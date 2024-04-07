import { useAuth } from './Auth';
import Header from './Header';
import bluePlanet2 from '../images/blue-planet-2.jpeg';
import alienShapesTalking from '../images/alien-shapes-talking.jpeg';
import { cx } from '@app/lib/utils';
import MembersExplorer from './MembersExplorer';
import PossibilitiesCloud from './PossibilitiesCloud';
import JoiningShowcase from './JoiningShowcase';
import ProgressiveSignUp from './ProgressiveSignUp/ProgressiveSignUp';

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
      <div class="relative overflow-hidden">
        <Header class="z-20" isAuth={!!memberAuth} signOut={signOut} />
        <div class="relative z-20 flex max-w-screen-md mx-auto text-white">
          <div class="flexcc flex-col h-full . xs:w-6/8 sm:w-1/2 px-2 . xs:px-4  py-2 sm:py-8 md:py-16 lg:py-24">
            <div class="bg-black/30 p-4 rounded-md">
              <h2 class="text-lg sm:text-2xl mb-2 line-height-tight">
                Get involved in an <strong>open web creation platform</strong> owned by the people
                who use it
              </h2>
              <p class="opacity-75 text-sm sm:text-base">
                Hojaweb is a members-driven project that aims to bring us together in creating our
                own web and apps with shared tools and knowledge
              </p>
            </div>
          </div>
        </div>
        <img
          src={bluePlanet2}
          class="max-w-8/4 w-8/4 xs:w-7/4 sm:w-5/4 md:w-full z-10 absolute top-0 -left-20 sm:left-0"
          style={{
            filter: 'brightness(250%) contrast(100%)',
          }}
        />
      </div>
      <PossibilitiesCloud possibilities={possibilities} />
      <div class="flex flex-col sm:flex-row space-x-4 py-4 sm:py-16 px-4 max-w-screen-md mx-auto">
        <div class="mb-4 sm:max-w-1/3 md:max-w-1/2">
          <img
            class="w-full rounded-2xl shadow-lg"
            src={alienShapesTalking}
            style={{ filter: 'brightness(250%) contrast(100%)' }}
          />
        </div>
        <div class="flex flex-col h-full items-center justify-center">
          <h2 class="text-2xl mb-2">
            Join and access <strong>consulting</strong> with the core team to create{' '}
            <strong class="bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-cyan-500">
              Possibility
            </strong>{' '}
            together
          </h2>
          <p class="text-black/50">
            We are counting on your questions and requests to drive the system to where it's needed.
            Tailor-fit solutions can be made for you and unlocked for everybody.
          </p>
        </div>
      </div>
      <MembersExplorer class="max-w-screen-md mx-auto md:mb-16" />
      <JoiningShowcase />
      <ProgressiveSignUp />
    </div>
  );
};

export default ValuePropositionPage;
