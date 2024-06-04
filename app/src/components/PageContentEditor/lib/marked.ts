import { marked } from 'marked';

// A storage for declared templates
// const templates: { [key: string]: string } = {};

// // Extend the lexer to recognize @declare directives
// const lexer = new marked.Lexer();
// const originalLex = lexer.lex;
// lexer.lex = function (src) {
//   console.log('SRC', src);
//   const templateRegex = /^@declare\s+(\w+)\s+(.+)/gm;
//   src = src.replace(templateRegex, (match, name, template) => {
//     console.log('Found template', template);
//     templates[name] = template;
//     return ''; // Remove the @declare line from the source
//   });
//   return originalLex.call(this, src);
// };

// // Extend the renderer to handle template usage
// const renderer = new marked.Renderer();
// const originalText = renderer.text;
// renderer.text = function (text) {
//   const templateUsageRegex = /\$(\w+)\(([^)]+)\)/g;
//   text = text.replace(templateUsageRegex, (match, templateName, args) => {
//     if (templates[templateName]) {
//       const argsArray = args.split(',').map((arg: any) => arg.trim().replace(/^"|"$/g, ''));
//       let result = templates[templateName];
//       argsArray.forEach((arg: any, index: any) => {
//         result = result.replace(`$${index + 1}`, arg);
//       });
//       return result;
//     }
//     return match;
//   });
//   return originalText.call(this, text);
// };

// const options = {
//   lexer,
//   renderer,
// };

// export default marked.setOptions(options);

export default marked;
