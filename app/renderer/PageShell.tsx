import '../styles';
import { AuthWrapper } from '../components/Auth';
import { PageContextProvider } from './usePageContext';
import { PageContext } from 'vike/types';

const PageShell = function ({
  children,
  pageContext,
}: {
  children: any;
  pageContext: PageContext;
}) {
  return (
    <PageContextProvider pageContext={pageContext}>
      <AuthWrapper>{children}</AuthWrapper>
    </PageContextProvider>
  );
};

export { PageShell };
