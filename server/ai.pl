
aiNormalPlay(TableNumber, SeatNumber, Board) :-
	at(BoardTable, TableNumber, Board),
	repeat,
		getNumberInput(SeatNumber, 0, 8, 1), % returns random number
		at(Token, SeatNumber, BoardTable),
		Token == '.',
	write(SeatNumber), nl.

aiEndPlay(TableNumber, SeatNumber, Board) :-
	repeat,
		getNumberInput(TableNumber, 0, 8, 1), % returns random number
		at(BoardTable, TableNumber, Board),
		find('.', 0, Index, BoardTable),
		Index \= -1,

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

% Receives the token, the table number to play, the board and returns [NewTableNumber, Board]
aiTurn(TeaToken, CurrTableNumber, Board, Result) :-
	write('AI '), write(TeaToken), write(' turn:'),
	aiPlay(CurrTableNumber, NewTable, SeatNumber, Board),
	serveTea(Board, NewTable, SeatNumber, TeaToken, NewBoard),
	Result = [[NewTable, SeatNumber], NewBoard].
