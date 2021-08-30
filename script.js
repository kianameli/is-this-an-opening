const game = new Chess();
const BASE_URL_OPENING = "https://explorer.lichess.ovh/master?fen=";
let $status = $("#status");
let $fen = $("#fen");
let $pgn = $("#pgn");

function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // only pick up pieces for the side to move
  if (
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

function onDrop(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return "snapback";

  updateStatus();
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
  board.position(game.fen());
}

function updateStatus() {
  var status = "";

  var moveColor = "White";
  if (game.turn() === "b") {
    moveColor = "Black";
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = "Game over, " + moveColor + " is in checkmate.";
  }

  // draw?
  else if (game.in_draw()) {
    status = "Game over, drawn position";
  }

  // game still on
  else {
    status = moveColor + " to move";

    // check?
    if (game.in_check()) {
      status += ", " + moveColor + " is in check";
    }
  }

  $status.html(status);
  $fen.html(game.fen());
  $pgn.html(game.pgn());
}

var config = {
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
};
let board = Chessboard("board", config);

updateStatus();

async function handleIsOpeningClick(evt) {
  const fen = encodeURI(game.fen());
  // console.log(fen);
  try {
    let res = await axios.get(`${BASE_URL_OPENING}${fen}`);
    console.log(res.data);
  } catch (error) {
    console.log(error);
  }
}

function handleResetClick(evt) {
  game.reset();
  board.position("start");
}

let isOpeningBtn = document.querySelector("#is-opening-button");
isOpeningBtn.addEventListener("click", handleIsOpeningClick);

let resetBtn = document.querySelector("#reset-button");
resetBtn.addEventListener("click", handleResetClick);
