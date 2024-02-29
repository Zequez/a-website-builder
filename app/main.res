%%raw(`import "virtual:uno.css"`)

// console.log('Hello there');

Js.log("Hello world")
let text = React.string

switch ReactDOM.querySelector("#root") {
| Some(rootElement) => {
    let root = ReactDOM.Client.createRoot(rootElement)
    ReactDOM.Client.Root.render(
      root,
      <div className="bg-red-300">
        {text("Hello from ReScript React")}
      </div>,
    )
  }
| None => Js.log("No #root element")
}
