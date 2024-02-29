module Editor exposing (..)
import Browser
import Html exposing (Html, text, div)
import Html.Attributes exposing (class)

type alias Model =
    ()


init : Model
init =
    ()


type Msg
    = NoOp

update : Msg -> Model -> Model
update msg model =
    model

view : Model -> Html Msg
view model =
    div [class "bg-red-200"] [
        text "Hello, World!"
    ]


main : Program () Model Msg
main =
    Browser.sandbox
        { init = init
        , update = update
        , view = view
        }