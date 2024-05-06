import { useEffect, useState } from 'preact/hooks';
import { Button } from './ui';

export default function UnhandledErrorsDisplay() {
  const [errors, _errors] = useState<string[]>([]);

  useEffect(() => {
    function handleError(err: ErrorEvent) {
      _errors([...errors, err.message]);
    }

    function handlePromiseError(err: PromiseRejectionEvent) {
      _errors([...errors, err.reason.message]);
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromiseError);
    };
  }, []);

  function handleDismiss() {
    _errors([]);
  }

  return errors.length > 0 ? (
    <div class="fixed top-2 min-w-70 left-1/2 translate-x-[-50%] p1 bg-red-400 rounded-md text-white  overflow-hidden b b-white/20 shadow-md">
      <div class="px2 py1 pr1 bg-white/10 flex">
        <div class="flex-grow">
          <div class="">Oops: Hubo algún error</div>
          {errors.map((message) => (
            <div class="text-sm font-mono opacity-70">{message}</div>
          ))}
        </div>
        <Button class="ml2 px4" customSize onClick={handleDismiss}>
          Ok
        </Button>
      </div>
    </div>
  ) : null;
}
