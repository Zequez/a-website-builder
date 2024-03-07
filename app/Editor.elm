module Editor exposing (..)

import Browser
import Html exposing (Html, button, div, h1, input, p, text, textarea)
import Html.Attributes exposing (class, classList, disabled, value)
import Html.Events exposing (onClick, onInput)


type alias Model =
    { member : String
    , logInStatus : LogInStatus
    }


type LogInStatus
    = Inactive
    | Loading
    | Error String
    | Success


init : Model
init =
    { member = "ezequiel", logInStatus = Inactive }


type Msg
    = MemberInput String
    | LogInClick
    | NoOp


update : Msg -> Model -> Model
update msg model =
    case msg of
        MemberInput val ->
            { model | member = val }

        LogInClick ->
            { model | logInStatus = Loading }

        NoOp ->
            model


view : Model -> Html Msg
view model =
    div [ class "font-sans text-gray-600 bg-blue-100 flex flex-col  h-screen" ]
        [ div [ class "h-12 text-lg bg-blue-400 border-b-1 border-blue-600 text-white flex items-center justify-center" ]
            [ text "A Website Builder"
            ]
        , case model.logInStatus of
            Success ->
                div [] [ text "Logged in successfully" ]

            _ ->
                div [ class "flex-grow flex flex-col items-center pt-1/3" ]
                    [ h1 [ class "text-5xl font-light tracking-0.5 mb-8" ]
                        [ text "Welcome"
                        ]
                    , case model.logInStatus of
                        Inactive ->
                            div [ class "mb-8 text-center w-full max-w-80" ]
                                [ p [ class "mb-2" ] [ text "What's your address?" ]
                                , input [ class "rounded-md px-4 py-2 text-center w-full mb-2", value model.member, onInput MemberInput ] []
                                , p [ class "opacity-60" ] [ text (model.member ++ ".aweb.club") ]
                                ]

                        _ ->
                            div [] []

                    -- , div [ class "mb-4 text-center w-full max-w-80" ]
                    --     [ p [ class "mb-2" ] [ text "What's your name?" ]
                    --     , input [ class "rounded-md px-4 py-2 text-center w-full" ] []
                    --     ]
                    , case model.logInStatus of
                        Error errMsg ->
                            div [ class "text-red-500" ] [ text errMsg ]

                        _ ->
                            div [] []
                    , case model.logInStatus of
                        Loading ->
                            spinner

                        _ ->
                            div [] []
                    , div []
                        [ button
                            [ class "bg-blue-400 text-white text-bold px-4 py-2 rounded-md uppercase tracking-0.5 font-bold border-b-2 border-blue-600 relative"
                            , classList
                                [ ( "opacity-25 grayscale", model.logInStatus == Loading )
                                , ( "active:top-[2px] active:border-transparent", model.logInStatus /= Loading )
                                ]
                            , disabled (model.logInStatus == Loading)
                            , onClick LogInClick
                            ]
                            [ text "Enter" ]
                        ]
                    ]
        ]


spinner : Html msg
spinner =
    div [ class "spinner mb-8 opacity-50" ]
        [ div [ class "border-t-blue-300!" ] []
        , div [ class "border-t-blue-500!" ] []
        , div [ class "border-t-blue-700!" ] []
        ]


logInScreen : Html Msg
logInScreen =
    div [] []


main : Program () Model Msg
main =
    Browser.sandbox
        { init = init
        , update = update
        , view = view
        }
