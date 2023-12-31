import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';

export const Swinesweeper = () => {
	const [board, setBoard] = useState([]);
	const [longPressDetected, setLongPressDetected] = useState(false);

	const newGameButtonStyles = useSpring({
		from: { transform: 'scale(1)' },
		to: { transform: 'scale(1.05)' },
		reverse: true,
		loop: {
			reverse: true,
			from: { transform: 'scale(1)' },
			to: { transform: 'scale(1.05)' },
		},
	});

	const checkForWin = (currentBoard) => {
		for (let i = 0; i < currentBoard.length; i++) {
			for (let j = 0; j < currentBoard[i].length; j++) {
				if (currentBoard[i][j].value !== '🐷' && !currentBoard[i][j].clicked) {
					return false; // Found a non-pig tile that hasn't been clicked.
				}
			}
		}
		return true; // All non-pig tiles have been clicked.
	};

	const generateBoard = () => {
		let board = [];
		for (let i = 0; i < 10; i++) {
			let row = [];
			for (let j = 0; j < 10; j++) {
				row.push({ value: 0, clicked: false, flagged: false });
			}
			board.push(row);
			console.log('board: ', board);
		}

		let pigsPlaced = 0;
		while (pigsPlaced < 10) {
			let x = Math.floor(Math.random() * 10);
			let y = Math.floor(Math.random() * 10);
			if (board[x][y].value === 0) {
				board[x][y].value = '🐷';
				pigsPlaced++;

				const directions = [
					[0, 1],
					[1, 0],
					[0, -1],
					[-1, 0],
					[-1, -1],
					[-1, 1],
					[1, -1],
					[1, 1],
				];

				for (let [dx, dy] of directions) {
					const nx = x + dx;
					const ny = y + dy;
					if (
						nx >= 0 &&
						ny >= 0 &&
						nx < 10 &&
						ny < 10 &&
						board[nx][ny].value !== '🐷'
					) {
						board[nx][ny].value += 1;
					}
				}
			}
		}

		setBoard(board);
	};

	const handleLongPress = (x, y) => {
		setBoard((prevBoard) => {
			const newBoard = JSON.parse(JSON.stringify(prevBoard));
			if (!newBoard[x][y].clicked) {
				newBoard[x][y].flagged = !newBoard[x][y].flagged;
			}
			return newBoard;
		});
	};

	const handleClick = (x, y) => {
		if (longPressDetected) {
			setLongPressDetected(false);
			return;
		}
		if (board[x][y].value === '🐷') {
			setBoard((prevBoard) => {
				const newBoard = JSON.parse(JSON.stringify(prevBoard));
				newBoard[x][y].clicked = true;
				return newBoard;
			});

			setTimeout(() => {
				alert('You lost! Try again!');
				setBoard((prevBoard) =>
					prevBoard.map((row) =>
						row.map((cell) => ({ ...cell, clicked: true }))
					)
				);
			}, 100);
			return;
		}

		setBoard((prevBoard) => {
			const newBoard = JSON.parse(JSON.stringify(prevBoard));
			const revealSurrounding = (x, y) => {
				if (x < 0 || y < 0 || x >= 10 || y >= 10 || newBoard[x][y].clicked) {
					return;
				}

				newBoard[x][y].clicked = true;

				if (newBoard[x][y].value === 0) {
					const directions = [
						[0, 1],
						[1, 0],
						[0, -1],
						[-1, 0],
						[-1, -1],
						[-1, 1],
						[1, -1],
						[1, 1],
					];

					for (let [dx, dy] of directions) {
						revealSurrounding(x + dx, y + dy);
					}
				}
			};

			revealSurrounding(x, y);

			if (checkForWin(newBoard)) {
				setTimeout(() => {
					alert('Congratulations! You won!');
					setBoard((prevBoard) =>
						prevBoard.map((row) =>
							row.map((cell) => ({ ...cell, clicked: true }))
						)
					);
				}, 100);
			}

			return newBoard;
		});
	};

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
			}}
		>
			<animated.button
				onClick={generateBoard}
				style={{
					...newGameButtonStyles,
					backgroundColor: 'green',
					color: 'white',
				}}
			>
				New Game
			</animated.button>
			<br />
			<div>
				{board.map((row, i) => (
					<div key={i} style={{ display: 'flex' }}>
						{row.map((cell, j) => (
							<button
								key={j}
								style={{
									width: '30px',
									height: '30px',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									fontSize: '18px',
									backgroundColor: cell.clicked
										? 'skyblue'
										: cell.flagged
										? 'yellow'
										: 'dodgerblue',
									WebkitUserSelect: 'none', // for iOS Safari
									WebkitTouchCallout: 'none',
									MsUserSelect: 'none',
									MozUserSelect: 'none',
									userSelect: 'none',
									WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
								}}
								onClick={() => handleClick(i, j)}
								onTouchStart={(e) => {
									e.preventDefault();
									setLongPressDetected(false);
									this.pressTimer = setTimeout(() => {
										handleLongPress(i, j);
										setLongPressDetected(true);
									}, 1000);
								}}
								onTouchEnd={() => clearTimeout(this.pressTimer)}
								onTouchMove={() => clearTimeout(this.pressTimer)}
								onContextMenu={(e) => {
									e.preventDefault();
									handleLongPress(i, j);
								}}
							>
								{cell.clicked ? cell.value : cell.flagged ? '🥓' : ''}
							</button>
						))}
					</div>
				))}
			</div>
		</div>
	);
};
