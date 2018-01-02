
%place to put waiter is empty
replaceByWaiter(BoardTable, SeatNumber, '.', NewBoardTable) :-
	replace('W', SeatNumber, BoardTable, NewBoardTable).
%place to put waiter is with O tea
replaceByWaiter(BoardTable, SeatNumber, 'O', NewBoardTable) :-
	replace('@', SeatNumber, BoardTable, NewBoardTable).
%place to put waiter is with O tea
replaceByWaiter(BoardTable, SeatNumber, 'X', NewBoardTable) :-
	replace('%', SeatNumber, BoardTable, NewBoardTable).
replaceByWaiter(BoardTable, _, _, NewBoardTable) :-
	assignValue(BoardTable, NewBoardTable).

replaceByTea(BoardTable, SeatNumber, 'W', NewBoardTable) :-
	replace('.', SeatNumber, BoardTable, NewBoardTable).
replaceByTea(BoardTable, SeatNumber, '@', NewBoardTable) :-
	replace('O', SeatNumber, BoardTable, NewBoardTable).
replaceByTea(BoardTable, SeatNumber, '%', NewBoardTable) :-
	replace('X', SeatNumber, BoardTable, NewBoardTable).
replaceByTea(BoardTable, _, _, NewBoardTable) :-
	assignValue(BoardTable, NewBoardTable).

moveWaiter(Board, Table, Seat, NewBoard) :-
	at(Elem, Table, Board),
	at(Token, Seat, Elem),
	replaceByWaiter(Elem, Seat, Token, NewElem),
	replace(NewElem, Table, Board, NewBoard).

eraseWaiter(Board, Index, WaiterIndex, NewBoard) :-
	Index >= 0,
	WaiterIndex >= 0,
	Index1 is Index-1,
	at(Elem, Index1, Board),
	at(CurrToken, WaiterIndex, Elem),
	replaceByTea(Elem, WaiterIndex, CurrToken, NewElem),
	replace(NewElem, Index1, Board, NewBoard).

eraseWaiter(Board, Index, -1, NewBoard) :-
	at(Elem, Index, Board),
	find('W', 0, WaiterIndex1, Elem),
	find('@', 0, WaiterIndex2, Elem),
	find('%', 0, WaiterIndex3, Elem),
	checkAndAssign(WaiterIndex1, WaiterIndex2, WaiterIndex3, WaiterIndex),
	Index1 is Index+1,
	eraseWaiter(Board, Index1, WaiterIndex, NewBoard).

handleWaiter(Board, Seat, NewBoard, NewSeat) :-
	eraseWaiter(Board, 0, -1, NewBoard1),
	moveWaiter(NewBoard1, Seat, Seat, NewBoard),
	NewSeat = Seat.
