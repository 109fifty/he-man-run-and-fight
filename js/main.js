import { Game } from "./game.js";

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");

new Game(canvas, overlay);
