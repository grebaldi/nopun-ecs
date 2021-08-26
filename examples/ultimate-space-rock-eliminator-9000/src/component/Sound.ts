import { Howl } from "howler";

//
// We're using howler for Sound. Our `Sound` component will hold a `Howl`
// instance. A system will be responsible for playing it back.
//
// see also: https://github.com/goldfire/howler.js#most-basic-play-an-mp3
//
export class Sound {
    value: Howl
}
