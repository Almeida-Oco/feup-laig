
aiNormalPlay(TableNumber, SeatNumber, Board) :-
	at(BoardTable, TableNumber, Board),
	repeat,
		getNumberInput(SeatNumber, 0, 8, 1), % returns random number
		at(Token, SeatNumber, BoardTable),
		Token == '.',
	write(SeatNumber), nl.

aiEndPlay(TableNumber, SeatNumber, Board) :-
	write('Targetted table full!'), nl,
	write('Insert table: '),
	repeat,
		getNumberInput(TableNumber, 0, 8, 1), % returns random number
		at(BoardTable, TableNumber, Board),
		find('.', 0, Index, BoardTable),
		Index \= -1,

	write(TableNumber), nl,
	write('Insert seat: '),
	repeat,
		getNumberInput(SeatNumber, 0, 8, 1),
		at(SeatToken, SeatNumber, BoardTable),
		SeatToken == '.',

	write(SeatNumber), nl.

aiPlay(CurrTableNumber, NewTableNumber, SeatNumber, Board) :-
	at(BoardTable, CurrTableNumber, Board),
	find('.', 0, FreeIndex, BoardTable),
	(
	FreeIndex \= -1 ->
		aiNormalPlay(CurrTableNumber, SeatNumber, Board), assignValue(CurrTableNumber, NewTableNumber)
		;
		aiEndPlay(NewTableNumber, SeatNumber, Board)
	).

aiTurn(TeaToken, CurrTableNumber, Board, NewBoard, NewTableNumber) :-
	write('AI '), write(TeaToken), write(' turn:'),
	aiPlay(CurrTableNumber, NewTableNumber1, SeatNumber, Board),
	serveTea(Board, NewTableNumber1, SeatNumber, TeaToken, NewBoard1),
	checkSpecials(NewBoard1, NewTableNumber1, SeatNumber,  TeaToken, NewBoard, NewTableNumber, 1),
	drawBoard(NewBoard).

aiNextPlay(Board, CurrTableNumber, Result) :-
	aiPlay(CurrTableNumber, NewTableNumber, SeatNumber, Board),
	Result = [SeatNumber, NewTableNumber].
