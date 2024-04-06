import '../styles';
import { AuthWrapper } from '../components/Auth';
import { PageContextProvider } from './usePageContext';

const PageShell = function ({ children, pageContext }: { children: any; pageContext: any }) {
  return (
    <PageContextProvider pageContext={pageContext}>
      <AuthWrapper>{children}</AuthWrapper>
    </PageContextProvider>
  );
};

export { PageShell };
