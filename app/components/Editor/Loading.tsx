import Spinner from '../Spinner';

export default function Loading({ check }: { check: any }) {
  return !check ? (
    <div class="w-full h-full flexcc">
      <Spinner />
    </div>
  ) : null;
}
