import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * The main React component for the Tic Tac Toe game.
 * Features:
 * - Player vs Player or Player vs AI
 * - Visual turn, win/draw indication
 * - Minimalistic, centered layout with restart button
 */

// Utility to calculate the game winner and if draw
// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /** Returns "X", "O", "draw", or null */
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  if (squares.every((v) => v !== null)) return "draw";
  return null;
}

// PUBLIC_INTERFACE
function getRandomMove(squares) {
  /** Returns a random empty index */
  const emptyIndices = squares
    .map((v, i) => (v === null ? i : null))
    .filter((v) => v !== null);
  if (emptyIndices.length === 0) return null;
  const idx = Math.floor(Math.random() * emptyIndices.length);
  return emptyIndices[idx];
}

// PUBLIC_INTERFACE
function Square({ value, onClick, highlight }) {
  /**
   * Renders a single tic tac toe square.
   * Highlighted if part of a winning line.
   */
  return (
    <button
      className={`ttt-square${highlight ? " highlight" : ""}`}
      onClick={onClick}
      aria-label={value ? `Cell ${value}` : "Empty cell"}
      disabled={!!value}
    >
      {value}
    </button>
  );
}

// PUBLIC_INTERFACE
function Board({ squares, onSquareClick, winnerLine }) {
  /** Renders the 3x3 grid, passing highlight prop for winning cells */
  function renderSquare(i) {
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onSquareClick(i)}
        highlight={winnerLine && winnerLine.includes(i)}
      />
    );
  }
  return (
    <div className="ttt-board">
      {[0, 1, 2].map((row) => (
        <div className="ttt-board-row" key={row}>
          {[0, 1, 2].map((col) => renderSquare(row * 3 + col))}
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function getWinnerLine(squares) {
  // Returns the winning line indices if any, else null
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return line;
    }
  }
  return null;
}


export default function App() {
  // "pvp" or "ai"
  const [mode, setMode] = useState("pvp");
  // always holds 9 items: "X", "O", or null
  const [squares, setSquares] = useState(Array(9).fill(null));
  // "X" (goes first) or "O"
  const [xIsNext, setXIsNext] = useState(true);
  // Current game result: "X", "O", "draw", or null
  const winner = calculateWinner(squares);
  const winnerLine = getWinnerLine(squares);
  const [status, setStatus] = useState("");
  // for accessibility/UX, lock UI briefly during AI move
  const [waitingAi, setWaitingAi] = useState(false);

  useEffect(() => {
    // Set the app theme variables on first mount
    document.documentElement.setAttribute("data-theme", "light");
    document.body.style.backgroundColor = "#f8f9fa";
  }, []);

  useEffect(() => {
    // AI plays "O" if mode is "ai" and it's O's turn and no winner
    if (mode === "ai" && !xIsNext && !winner) {
      setWaitingAi(true);
      const timer = setTimeout(() => {
        const move = getRandomMove(squares);
        if (move !== null) {
          const newSquares = squares.slice();
          newSquares[move] = "O";
          setSquares(newSquares);
          setXIsNext(true);
        }
        setWaitingAi(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mode, squares, xIsNext, winner]);

  useEffect(() => {
    // Status message
    if (winner === "draw") {
      setStatus("It's a draw! 🤝");
    } else if (winner === "X") {
      setStatus(mode === "ai" ? "You win! 🎉" : "Player X wins! 🏆");
    } else if (winner === "O") {
      setStatus(mode === "ai" ? "AI wins! 🤖🏆" : "Player O wins! 🏆");
    } else {
      if (mode === "ai") {
        setStatus(xIsNext ? "Your turn (X)" : "AI's turn (O)");
      } else {
        setStatus(xIsNext ? "Player X's turn" : "Player O's turn");
      }
    }
  }, [winner, xIsNext, mode]);

  // PUBLIC_INTERFACE
  function handleSquareClick(i) {
    if (winner || squares[i] != null || (mode === "ai" && !xIsNext) || waitingAi) {
      return;
    }
    const newSquares = squares.slice();
    newSquares[i] = xIsNext ? "X" : "O";
    setSquares(newSquares);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  // PUBLIC_INTERFACE
  function handleModeChange(newMode) {
    if (mode !== newMode) {
      setMode(newMode);
      handleRestart();
    }
  }

  return (
    <div className="ttt-root" style={{ minHeight: "100vh" }}>
      <main className="ttt-main">
        <h1 className="ttt-header">Tic Tac Toe</h1>
        <div className="ttt-mode-select" role="radiogroup" aria-label="Select play mode">
          <button
            className={`ttt-mode-btn${mode === "pvp" ? " selected" : ""}`}
            onClick={() => handleModeChange("pvp")}
            aria-pressed={mode === "pvp"}
          >
            Player vs Player
          </button>
          <button
            className={`ttt-mode-btn${mode === "ai" ? " selected" : ""}`}
            onClick={() => handleModeChange("ai")}
            aria-pressed={mode === "ai"}
          >
            Player vs AI
          </button>
        </div>
        <div className="ttt-status" aria-live="polite">
          {status}
        </div>
        <Board
          squares={squares}
          onSquareClick={handleSquareClick}
          winnerLine={winnerLine}
        />
        <button className="ttt-restart-btn" onClick={handleRestart} aria-label="Restart game">
          Restart Game
        </button>
        <div style={{ height: 16 }} />
      </main>
      <footer className="ttt-footer">
        <small>
          Minimalist Tic Tac Toe &mdash; <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React.js</a>
        </small>
      </footer>
    </div>
  );
}
