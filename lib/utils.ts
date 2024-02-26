export const colorConsole = {
  green: (text: string, ...other: any) => console.log('\x1b[32m%s\x1b[0m', text, ...other),
  greenBg: (text: string) => console.log('\x1b[42m%s\x1b[0m', text),
  red: (text: string) => console.log('\x1b[31m%s\x1b[0m', text),
};

export function rowsToJson(rows: Record<string, any>[], excludeColumns: string[] = []) {
  return rows.map((row) => {
    const json: Record<string, any> = { ...row };
    for (const column of excludeColumns) {
      delete json[column];
    }
    return json;
  });
}
