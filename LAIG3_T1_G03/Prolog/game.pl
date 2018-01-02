:-include('utils.pl').
:-include('io.pl').
:-include('specials.pl').
:-include('create.pl').
:-include('waiter.pl').
:-include('ai.pl').
:-use_module(library(system)).
:-use_module(library(lists)).


validPlay(Board, TableNumber, SeatNumber) :-
	nth0(TableNumber, Board, BoardTable),
	nth0(SeatNumber, BoardTable, SeatToken),
	SeatToken == '.'.

normalPlay(TableNumber, SeatNumber, TeaToken, Board) :-
	write('Player '), write(TeaToken), write(' turn: '),
	at(BoardTable, TableNumber, Board),
	repeat,
		getNumberInput(SeatNumber, 0, 8),
		at(Token, SeatNumber, BoardTable),
		Token == '.'.

endPlay(NewTableNumber, SeatNumber, TeaToken, Board) :-
	write('Player '), write(TeaToken),
	write('Targetted table full!'), nl,
	write('Insert table: '),
	repeat,
		getNumberInput(NewTableNumber, 0, 8), nl,
		at(BoardTable, NewTableNumber, Board),
		find('.', 0, Index, BoardTable),
		Index \= -1,

	write('Insert seat: '),
	repeat,
		getNumberInput(SeatNumber, 0, 8), nl,
		at(SeatToken, SeatNumber, BoardTable),
		SeatToken == '.'.

play(CurrTableNumber, NewTableNumber, SeatNumber, TeaToken, Board) :-
	at(BoardTable, CurrTableNumber, Board),
	find('.', 0, FreeIndex, BoardTable),
	(
	FreeIndex \= -1 ->
		normalPlay(CurrTableNumber, SeatNumber, TeaToken, Board), assignValue(CurrTableNumber, NewTableNumber)
		;
		endPlay(NewTableNumber, SeatNumber, TeaToken, Board)
	).

play_server(CurrTableNumber, NewTableNumber1, SeatNumber, TeaToken, Board) :-
	at(BoardTable, CurrTableNumber, Board),
	at('.', SeatNumber, BoardTable).


serveTea(Board, Table, Seat, TeaToken, NewBoard) :-
	at(Elem, Table, Board),
	replace(TeaToken, Seat, Elem, NewElem),
	replace(NewElem, Table, Board, NewBoard).

turn(TeaToken, CurrTableNumber, Board, NewBoard, NewTableNumber) :-
	play(CurrTableNumber, NewTableNumber1, SeatNumber, TeaToken, Board),
	serveTea(Board, NewTableNumber1, SeatNumber, TeaToken, NewBoard1),
	checkSpecials(NewBoard1, NewTableNumber1, SeatNumber, TeaToken, NewBoard, NewTableNumber, 0),
	drawBoard(NewBoard).

/*  ----------------- SPECIALS ----------------------
	0 -> X Player move tea (XMT)
	1 -> O Player move tea (OMT)
	2 -> X Player move Waiter (XMW)
	3 -> O Player move Waiter (OMW)
	4 -> Rotate table (ROT)
	5 -> Rotate table (ROT)
	6 -> Swap both not claimed (SUU)
	7 -> Swap claimed with unclaimed (SCU)
*/
checkSpecial(Board, Table, Seat, 0, TeaToken, NewBoard, NewSeatNumber, AI) :-
	TeaToken == 'X',
	moveOneToOther_3(Board, Table, TeaToken, NewBoard1, AI),
	handleWaiter(NewBoard1, Seat, NewBoard2, NewSeatNumber),
	resetSpecial(NewBoard2, Table, NewBoard).

checkSpecial(Board, Table, Seat, 1, TeaToken, NewBoard, NewSeatNumber, AI) :-
	TeaToken == 'O',
	moveOneToOther_3(Board, Table, TeaToken, NewBoard1, AI),
	handleWaiter(NewBoard1, Seat, NewBoard2, NewSeatNumber),
	resetSpecial(NewBoard2, Table, NewBoard).

checkSpecial(Board, Table, _, 	 2, TeaToken, NewBoard, NewSeatNumber, AI) :-
	TeaToken == 'X',
	moveWaiterToOther_4(Board, Table, TeaToken, NewBoard1, NewSeatNumber, AI),
	resetSpecial(NewBoard1, Table, NewBoard).

checkSpecial(Board, Table, _, 	 3, TeaToken, NewBoard, NewSeatNumber, AI) :-
	TeaToken == 'O',
	moveWaiterToOther_4(Board, Table, TeaToken, NewBoard1, NewSeatNumber, AI),
	resetSpecial(NewBoard1, Table, NewBoard).

checkSpecial(Board, Table, Seat, 4, TeaToken, NewBoard, NewSeatNumber, AI) :-
	rotateTable_4(Board, Table, TeaToken, NewBoard1, AI),
	handleWaiter(NewBoard1, Seat, NewBoard2, NewSeatNumber),
	resetSpecial(NewBoard2, Table, NewBoard).

checkSpecial(Board, Table, Seat, 5, TeaToken, NewBoard, NewSeatNumber, AI) :-
	rotateTable_4(Board, Table, TeaToken, NewBoard1, AI),
	handleWaiter(NewBoard1, Seat, NewBoard2, NewSeatNumber),
	resetSpecial(NewBoard2, Table, NewBoard).

checkSpecial(Board, Table, Seat, 6, TeaToken, NewBoard, NewSeatNumber, AI) :-
	swapTables_4(Board, Table, TeaToken, NewBoard1, AI),
	handleWaiter(NewBoard1, Seat, NewBoard2, NewSeatNumber),
	resetSpecial(NewBoard2, Table, NewBoard).

checkSpecial(Board, Table, Seat, 7, TeaToken, NewBoard, NewSeatNumber, AI) :-
	swapTables_5(Board, Table, TeaToken, NewBoard1, AI),
	handleWaiter(NewBoard1, Seat, NewBoard2, NewSeatNumber),
	resetSpecial(NewBoard2, Table, NewBoard).

%fail case
checkSpecial(Board, _, Seat, _, _, NewBoard, NewSeatNumber, _) :-
	handleWaiter(Board, Seat, NewBoard, NewSeatNumber).

%TableNumber is the actual number, the corresponding special is at Table - 1
resetSpecial(Board, TableNumber, NewBoard) :-
	at(Specials, 9, Board),
	TableSpecial is TableNumber - 1,
	write('Resetting special at table: '), write(TableSpecial), nl,
	replace(8, TableSpecial, Specials, NewSpecials),
	replace(NewSpecials, 9, Board, NewBoard).

% ------------------- END SPECIALS ------------------

checkSpecials(Board, Table, Seat, TeaToken, NewBoard, NewSeatNumber, AI) :-
	Table \= 0,
	at(Specials, 9, Board),
	Table1 is Table - 1,
	at(Special, Table1, Specials),
	checkSpecial(Board, Table, Seat, Special, TeaToken, NewBoard, NewSeatNumber, AI).

checkSpecials(Board, 0, Seat, _, NewBoard, NewSeatNumber, _) :-
	handleWaiter(Board, Seat, NewBoard, NewSeatNumber).

endCondition(Board, TeaToken) :- %  For player X
	countMajorTables(Board, TeaToken, 0, 0, Total),
	Total > 4,
	write('Congratulations Player'), write(TeaToken), write(' you have won.'), nl,
	halt.

gameLoop(End, Table, Board, 0) :- % Human Version
	turn('X', Table, Board, NewBoard1, NewTable),
	\+ endCondition(NewBoard1, 'X'),
	turn('O', NewTable, NewBoard1, NewBoard2, NewTable1),
	\+ endCondition(NewBoard2, 'O'),
	gameLoop(End, NewTable1, NewBoard2, 0).

gameLoop(End, Table, Board, 1) :- % Ai Version human becomes 'X'
  turn('X', Table, Board, NewBoard1, NewTable),
	\+ endCondition(NewBoard1, 'X'),
  aiTurn('O', NewTable, NewBoard1, NewBoard2, NewTable1),
	\+ endCondition(NewBoard2, 'O'),
  gameLoop(End, NewTable1, NewBoard2, 1).

gameLoop(End, Table, Board, 2) :- % AI vs AI Version
  aiTurn('X', Table, Board, NewBoard1, NewTable),
	\+ endCondition(NewBoard1, 'X'),
  % sleep(2),
  aiTurn('O', NewTable, NewBoard1, NewBoard2, NewTable1),
	\+ endCondition(NewBoard2, 'O'),
  % sleep(2),
  gameLoop(End, NewTable1, NewBoard2, 2).

start(AI) :-
	clearScreen,
	createTables(Board,0,10),
	moveWaiter(Board, 0, 0, NewBoard),
	drawBoard(NewBoard),
	gameLoop(0, 0, NewBoard, AI).


/* ------------- LAIG -------------------- */

start_laig(AI, BoardRes) :-
	createTables(Board,0,10),
	moveWaiter(Board, 0, 0, NewBoard),
	BoardRes = NewBoard.
/*	gameLoopLAIG(0, 0, BoardRes, AI). */

gameLoopLAIG(End, Table, Board, 0) :- % Human Version
	turn('X', Table, Board, NewBoard1, NewTable),
	\+ endCondition(NewBoard1, 'X'),
	turn('O', NewTable, NewBoard1, NewBoard2, NewTable1),
	\+ endCondition(NewBoard2, 'O'),
	gameLoop(End, NewTable1, NewBoard2, 0).

gameLoopLAIG(End, Table, Board, 1) :- % Ai Version human becomes 'X'
  turn('X', Table, Board, NewBoard1, NewTable),
	\+ endCondition(NewBoard1, 'X'),
  aiTurn('O', NewTable, NewBoard1, NewBoard2, NewTable1),
	\+ endCondition(NewBoard2, 'O'),
  gameLoop(End, NewTable1, NewBoard2, 1).



/* ------------- END LAIG -------------------- */

playMenu :-
	clearScreen,
	printPlayMenu,
	getNumberInput(Option, 1, 4),
	(
		Option == 1 -> write('Starting Human vs Human \n'), start(0), startMenu;
		Option == 2 -> write('Starting Ai vs Human \n'), start(1), startMenu;
		Option == 3 -> write('Starting Ai vs Ai \n'), start(2), startMenu;
		startMenu
	).

startMenu :-
	clearScreen,
	printMenu,
	getNumberInput(Option, 1, 3),
	(
		Option = 1 -> clearScreen, playMenu, startMenu;
		Option = 2 -> clearScreen, printInfoMenu, get_code(_), startMenu
	).

play :-
	startMenu.

%============================Counting Tables ================================
xPiece('X',1).
xPiece('%',1).
xPiece('O',0).
xPiece('@',0).
xPiece('W',0).
xPiece('.',0).

oPiece('X', 0).
oPiece('%', 0).
oPiece('O', 1).
oPiece('@', 1).
oPiece('W', 0).
oPiece('.', 0).

countTableTokens(_, _, 9, PreviousTotal, NewTotal) :-
	NewTotal = PreviousTotal.
countTableTokens(BoardTable, 'X', Index, PreviousTotal, NewTotal) :-
	Index1 is Index+1,
	at(Token, Index, BoardTable),
	xPiece(Token, Inc),
	NextTotal is PreviousTotal + Inc,
	countTableTokens(BoardTable, 'X', Index1, NextTotal, NewTotal).
countTableTokens(BoardTable, 'O', Index, PreviousTotal, NewTotal) :-
	Index1 is Index+1,
	at(Token, Index, BoardTable),
	oPiece(Token, Inc),
	NextTotal is PreviousTotal + Inc,
	countTableTokens(BoardTable, 'O', Index1, NextTotal, NewTotal).

countMajorTables(_, _, 9, PreviousTotal, NewTotal) :-
	NewTotal = PreviousTotal.
countMajorTables(Board, TeaToken, Index, PreviousTotal, NewTotal) :-
	Index1 is Index+1,
	at(BoardTable, Index, Board),
	countTableTokens(BoardTable, TeaToken, 0, 0, Total),
	(Total > 4 -> NextTotal is PreviousTotal+1 ; NextTotal is PreviousTotal+0),
	countMajorTables(Board, TeaToken, Index1, NextTotal, NewTotal).

%//============================Counting Tables ================================
