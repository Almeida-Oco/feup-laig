:-use_module(library(random)).

createSeats([], M, M). 		%Stop if 2nd args = 3rd arg meaning max elems reached
%Creates the seats of a table
createSeats([H|T], N, M) :-
	N < M, 									%add elements until max elements is reached
	N1 is N+1, 							%keep track of added element
	H = '.', 								%element to add
	createSeats(T,N1,M).  	%recursive call

createTables([], M, M).

createTables([Head|Tail], 9, M) :-
	M1 is M-2,
	assignSpecials(Head, 0, M1),
	createTables(Tail, M, M).

%Creates the tables of the game
createTables([H|T], N, M) :-
	N \= 9,
	N < M,
	N1 is N+1,
	M1 is M-1,
	createSeats(H,0,M1),
	createTables(T, N1, M).

assignSpecials(Specials, Index, Size) :-
	assignSpecials(Specials, Index, Size, _).

assignSpecials([], Index, Index, _).
assignSpecials([Head|Tail], Index, End, SpecialsCopy) :-
	Index < End,
	Index1 is Index+1,
	repeat, %repeat until a new random is generated
		random(0, End, Special),
		(Index == 0 ; \+ member(Special, SpecialsCopy)),

	push(Special, SpecialsCopy, NewSpecials),
	Head = Special,
	assignSpecials(Tail, Index1, End, NewSpecials).
