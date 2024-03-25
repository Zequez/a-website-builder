import * as preact from 'preact';

export default function (
  components: { [key: string]: any },
  data: { [key: string]: any },
  content: string,
) {
  const h = preact.createElement;
  const Fragment = preact.Fragment;
  try {
    return eval(content);
  } catch (e) {
    console.error('Code evaluation error; dumping data', e);
    console.log('Components: ', components);
    console.log('Data: ', data);
    console.log(content);
    throw e;
  }
}
