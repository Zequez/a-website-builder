export default function (
  html: any,
  components: { [key: string]: any },
  data: { [key: string]: any },
  content: string,
) {
  return eval(content);
}
