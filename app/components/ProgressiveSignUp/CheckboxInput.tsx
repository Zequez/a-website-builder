import SquareCheck from '~icons/fa6-solid/square-check';
import Square from '~icons/fa6-regular/square';

export default function CheckboxInput({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label class="flex text-black/50 items-center h-10 cursor-pointer mb-4">
      <input
        class="h-0 w-0 opacity-0 peer"
        type="checkbox"
        checked={checked}
        onChange={({ currentTarget }) => onChange(currentTarget.checked)}
      />
      <div class="peer-focus:bg-slate-500/50 rounded-md -ml-2 px-2">
        {checked ? <SquareCheck class="h-8 " /> : <Square class="h-8" />}
      </div>{' '}
      {label}
    </label>
  );
}
