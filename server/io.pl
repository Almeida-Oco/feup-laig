specToChar(0, 'XMT').
specToChar(1, 'OMT').
specToChar(2, 'XMW').
specToChar(3, 'OMW').
specToChar(4, 'ROT').
specToChar(5, 'ROT').
specToChar(6, 'SUU').
specToChar(7, 'SCU').
specToChar(8, 'XXX').

%draws top seats
drawST(L) :-
	at(Token,3,L),
	write(Token).
%draws top middle seats
drawSTM(L) :-
	at(Token1,4,L), write(Token1),
	space(5), at(Token2,2,L), write(Token2).
%draws middle seats
drawSM(L) :-
	at(Token1,5,L), write(Token1),
	space(3), at(Token2,0,L), write(Token2),
	space(3), at(Token3,1,L), write(Token3).
%draws bottom middle seats
drawSBM(L) :-
	at(Token1,6,L), write(Token1),
	space(5), at(Token2,8,L), write(Token2).
%draws bottom seats
drawSB(L) :-
	at(Token,7,L), write(Token).

%draws special top
drawSpecT(L) :-
	at(Temp, 2, L), specToChar(Temp, Token),
	write(Token).
%draws special top middle
drawSpecTM(L) :-
	at(Temp1, 3, L), at(Temp2, 1, L),
	specToChar(Temp1, Token1), specToChar(Temp2, Token2),
	write(Token1), space(3), write(Token2).
%draws special middle
drawSpecM(L) :-
	at(Temp1, 4, L), at(Temp2, 0, L),
	specToChar(Temp1, Token1), specToChar(Temp2, Token2),
	write(Token1), space(5), write(Token2).
%draws special bottom middle
drawSpecBM(L) :-
	at(Temp1, 5, L), at(Temp2, 7, L),
	specToChar(Temp1, Token1), specToChar(Temp2, Token2),
	write(Token1), space(3), write(Token2).
%draws special bottom
drawSpecB(L) :-
	at(Temp, 6, L), specToChar(Temp, Token), write(Token).

drawBoard(Board) :-
	Example = [0,1,2,3,4,5,6,7,8],
	at(L1,3,Board),
	at(Specials, 9, Board),
	space(4), drawST(Example), space(27), drawST(L1), space(25), drawSpecT(Specials), nl,
	space(1), drawSTM(Example), space(21), drawSTM(L1), space(19), drawSpecTM(Specials), nl,
	drawSM(Example), space(19), drawSM(L1), space(17), drawSpecM(Specials), nl,
	space(1), drawSBM(Example), space(21), drawSBM(L1), space(19), drawSpecBM(Specials), nl,
	space(4), drawSB(Example), space(27), drawSB(L1), space(25), drawSpecB(Specials), nl,

	at(L2,4,Board), at(L3,2,Board),
	space(14), drawST(L2), space(33), drawST(L3), nl,
	space(11), drawSTM(L2), space(27), drawSTM(L3), nl,
	space(10), drawSM(L2), space(25), drawSM(L3), nl,
	space(11), drawSBM(L2), space(27), drawSBM(L3), nl,
	space(14), drawSB(L2), space(33), drawSB(L3), nl,

	at(L4,5,Board), at(L5,0,Board), at(L6,1,Board),
	space(9), drawST(L4), space(22), drawST(L5), space(22), drawST(L6), nl,
	space(6), drawSTM(L4), space(16), drawSTM(L5), space(16), drawSTM(L6), nl,
	space(5), drawSM(L4), space(14), drawSM(L5), space(14), drawSM(L6), nl,
	space(6), drawSBM(L4), space(16), drawSBM(L5), space(16), drawSBM(L6), nl,
	space(9), drawSB(L4), space(22), drawSB(L5), space(22), drawSB(L6), nl,

	at(L7,6,Board), at(L8,8,Board),
	space(14), drawST(L7), space(33), drawST(L8), nl,
	space(11), drawSTM(L7), space(27), drawSTM(L8), nl,
	space(10), drawSM(L7), space(25), drawSM(L8), nl,
	space(11), drawSBM(L7), space(27), drawSBM(L8), nl,
	space(14), drawSB(L7), space(33), drawSB(L8), nl,

	at(L9,7,Board),
	space(32), drawST(L9), nl,
	space(29), drawSTM(L9), nl,
	space(28), drawSM(L9), nl,
	space(29), drawSBM(L9), nl,
	space(32), drawSB(L9), nl.

space(End,End).
space(Start,End):-
  write(' '),
  Start1 is Start+1,
  space(Start1,End).

space(Number) :-
	space(0, Number).

printMenu :-
	write('======================================\n'),
	write('=             Oolong Tea             =\n'),
	write('=           ==============           =\n'),
	write('=                                    =\n'),
	write('=              1 - Start             =\n'),
	write('=              2 - Rules             =\n'),
	write('=              3 - Exit              =\n'),
	write('=                                    =\n'),
	write('=                                    =\n'),
	write('=  Goncalo Moreno        up201503871 =\n'),
	write('=  Joao Almeida          up201505866 =\n'),
	write('======================================\n').


printPlayMenu :-
	write('======================================\n'),
	write('=             Play Mode              =\n'),
	write('=           =============            =\n'),
	write('=                                    =\n'),
	write('=          1 - Human vs Human        =\n'),
	write('=          2 - Ai vs Human           =\n'),
	write('=          3 - Ai vs Ai              =\n'),
	write('=          4 - Exit                  =\n'),
	write('=                                    =\n'),
	write('=  Goncalo Moreno        up201503871 =\n'),
	write('=  Joao Almeida          up201505866 =\n'),
	write('======================================\n').


printInfoMenu :-
	write('========================================================\n'),
	write('=                      Info Menu                       =\n'),
	write('=                    =============                     =\n'),
	write('=                                                      =\n'),
	write('= Oolong is a game of area control for two players.    =\n'),
	write('= Take turns serving tea to tables in the tea house    =\n'),
	write('= in an attempt to serve more of your tea than your    =\n'),
	write('= opponent. Your turn consists of simply placing a     =\n'),
	write('= token on a tile, but your play tells your opponent   =\n'),
	write('= where theyre allowed to play next. Controlling a     =\n'),
	write('= tile will trigger that table s special of the day,   =\n'),
	write('= a unique one time ability. Will you be shrewd enough =\n'),
	write('= to fully serve the most tables and savor sweet       =\n'),
	write('= victory?                                             =\n'),
	write('=                                                      =\n'),
	write('= The 9 tiles are arranged just like a regular compass =\n'),
	write('= rose, plus the center. Players take turns placing a  =\n'),
	write('= token of their color. The space in which a token is  =\n'),
	write('= placed indicates the tile on which the next player   =\n'),
	write('= will place their token. The player who is first to   =\n'),
	write('= occupy 5 spaces on a tile controls that tile. Unique =\n'),
	write('= special abilities for each tile are triggered at     =\n'),
	write('= different levels of completeness.                    =\n'),
	write('= Whomever is first to control 5 tiles wins.           =\n'),
	write('=                                                      =\n'),
	write('=                                                      =\n'),
	write('=          PRESS ANY KEY AND ENTER TO GO BACK          =\n'),
	write('=                                                      =\n'),
	write('=                                                      =\n'),
	write('= Goncalo Moreno                           up201503871 =\n'),
	write('= Joao Almeida                             up201505866 =\n'),
	write('========================================================\n').


clearScreen :-
	write('\33\[2J').


mainCliMenu :-
	clearScreen,
	printMainMenu,
	getChar(In),
	(
		In = '1' -> write('Chose to play\n'), playMenu;
		In = '2' -> write('Chose Info\n'), infoMenu;
		In = '3' -> write('Chose Exit\n');
		mainMenu
	).

% 0 means ask user, 1 means generate
getNumberInput(Input, Min, Max, 0) :-
	getNumberInput(Input, Min, Max).
getNumberInput(Input, Min, Max, 1) :-
	Max1 is Max + 1,
	random(Min, Max1, Input).

%Gets a number from user that must be within [Min, Max]
getNumberInput(Input, Min, Max) :-
	repeat,
		get_code(Input1),
		peek_code(Enter),
		skip_line,
		Enter == 10,
		Input is Input1 - 48,
		Input >= Min,
		Input =< Max.

%asks for an unclaimed table
% AI == 1 is it is an AI
getUnclaimedTable(Board, TableNumber, AI) :-
	write('Input an unclaimed table: '),
	repeat,
		getNumberInput(TableNumber, 0, 8, AI),
		at(BoardTable, TableNumber, Board),
		count(BoardTable, 'O', TempO1),
		count(BoardTable, '@', TempO2),
		TotalO is TempO1 + TempO2,
		count(BoardTable, 'X', TempX1),
		count(BoardTable, '%', TempX2),
		TotalX is TempX1 + TempX2,
		TotalO @=< 4,
		TotalX @=< 4.
