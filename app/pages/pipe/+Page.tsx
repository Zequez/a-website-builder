import { useAuth } from '@app/lib/AuthContext';
import Header from '@app/components/Header';
import { apiFetch } from '@app/lib/apiHelpers';

import Admin from '@app/components/Admin';
import { useEffect, useState } from 'preact/hooks';
import { useLocalStorageState } from '@app/lib/utils';

export default function Page() {
  const { fullMember, memberAuth, signOut } = useAuth();
  const [fun, setFun] = useLocalStorageState('_pipe_fun_', '');
  const [query, setQuery] = useLocalStorageState('_pipe_query_', '');
  const [output, setOutput] = useState<any>();

  async function run(ev: SubmitEvent) {
    ev.preventDefault();
    try {
      let queryToParse = query || '{}';
      if (!queryToParse.startsWith('{')) queryToParse = `{${queryToParse}}`;
      const parsedQuery = JSON.parse(queryToParse);
      if (typeof parsedQuery !== 'object') return;
      const fetchResult = await apiFetch(
        'POST',
        `pipe/${fun}`,
        parsedQuery as Record<string, any>,
        memberAuth?.token,
      );
      setOutput(fetchResult);
    } catch (e) {
      console.error('Error parsing query', e);
    }
  }

  return (
    <div class="min-h-screen">
      {memberAuth ? (
        <div class="flex h-screen">
          <form
            onSubmit={run}
            class="flex flex-col b br-2 p2 b-slate-400 bg-slate-100 h-full w-1/3"
          >
            <div class="flex space-x-2 mb-2">
              <input
                class="rounded-md b b-2 px2 py1 b-slate-200 w-full flex-grow"
                type="text"
                value={fun}
                onChange={(e) => setFun(e.currentTarget.value)}
              />
              <button class="px2 py1 bg-slate-400 text-white rounded-md">RUN</button>
            </div>
            <textarea
              class="p2 font-mono flex-grow rounded-md b b-2 b-slate-200 w-full"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            ></textarea>
          </form>
          <div class="whitespace-pre font-mono w-2/3 bg-slate-500 text-white overflow-auto">
            {JSON.stringify(output, null, 2)}
          </div>
        </div>
      ) : (
        'Not logged in'
      )}
    </div>
  );
}

function PipeSandbox() {
  return (
    <div>
      <input type="text" value="" />
      <textarea></textarea>
    </div>
  );
}
