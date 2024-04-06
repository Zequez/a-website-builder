// `usePageContext` allows us to access `pageContext` in any React component.
// More infos: https://vike.dev/pageContext-anywhere

import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

const Context = createContext(undefined);

const PageContextProvider = function ({
  pageContext,
  children,
}: {
  pageContext: any;
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
