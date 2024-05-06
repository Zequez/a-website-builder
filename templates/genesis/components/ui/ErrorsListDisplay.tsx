import { capitalizeFirstLetter } from '@shared/utils';
import { ValidationError } from '../../config-validator';

export default function ErrorsListDisplay(p: { errors: ValidationError[]; class?: string }) {
  return p.errors.length ? (
    <div class={`flex space-y-2 ${p.class}`}>{p.errors.map(validationErrorToMessage)}</div>
  ) : null;
}

function validationErrorToMessage(error: ValidationError) {
  return (
    <div class="text-red-500">
      [{error.path}] {capitalizeFirstLetter(error.message)}
      {Object.keys(error.params).length ? <div>{JSON.stringify(error.params)}</div> : null}
    </div>
  );
}
