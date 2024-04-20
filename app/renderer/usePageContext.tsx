// `usePageContext` allows us to access `pageContext` in any React component.
// More infos: https://vike.dev/pageContext-anywhere

import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { PageContext } from 'vike/types';

const Context = createContext<PageContext>(undefined!);

const PageContextProvider = function ({
  pageContext,
  children,
}: {
  pageContext: PageContext;
  children: any;
}) {
  return <Context.Provider value={pageContext}>{children}</Context.Provider>;
};

function usePageContext() {
  const pageContext = useContext(Context);
  return pageContext;
}

export { PageContextProvider };
export { usePageContext };
