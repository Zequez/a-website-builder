export function interfaceToType(s: string, exportIt?: boolean) {
  return s
    .replace(/export interface (.*) {/g, `${exportIt ? 'export ' : ''}type $1 = {`)
    .replace(/export type (.*) = (.*)/g, `${exportIt ? 'export ' : ''}type $1 = $2`);
}

export const MARKER = '/* GENERATED */';
