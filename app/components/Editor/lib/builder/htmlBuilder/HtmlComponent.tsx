const Html = (props: any) => (
  <html>
    <head lang={props.lang || 'en'}>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" type="image/emoji" href={props.icon || '🔅'} />
      <title>{props.title || 'Untitled'}</title>
    </head>
    <body class={props.class}>{props.children}</body>
  </html>
);

export default Html;
