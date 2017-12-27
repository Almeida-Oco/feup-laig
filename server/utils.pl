at(Elem,0,[Elem|_]).
at(Elem,Index,[_|Tail]) :-
	Index1 is Index - 1,
	Index > 0,
	at(Elem,Index1,Tail).

assignValue(V1, V1).
assignValue(V1, V2) :-
	V1 \= V2,
	assignValue(V1, V1).

%checks if any of the values if different from -1 and returns it
checkAndAssign(-1, -1, -1, -1).
checkAndAssign(-1, -1, Value, Value).
checkAndAssign(-1, Value, -1, Value).
checkAndAssign(Value, -1, -1, Value).


push(Elem, [], [Head|Tail]) :-
	Head = Elem,
	Tail = [].

push(Elem, [Head|Tail], [NewHead|NewTail]) :-
	NewHead = Head,
	push(Elem, Tail, NewTail).

find(_, _, Start1, []) :-
	Start1 = -1.
find(ElemToFind, Start, Start1, [ElemToFind|_]) :-
	Start1 = Start.
find(ElemToFind, Start, Index, [_|Tail]) :-
	Index \== -1,
	Index1 is Start+1,
	find(ElemToFind, Index1, Index, Tail).


count([],_,0).
count([Head|Tail], Head, Total) :-
	count(Tail, Head, Total1),
	Total is 1+Total1.
count([Head|Tail], Elem, Total) :-
	Head \= Elem,
	count(Tail, Elem, Total).

countTokens(BoardTable, 'O', Total) :-
	count(BoardTable, 'O', TempO1),
	count(BoardTable, '@', TempO2),
	Total is TempO1 + TempO2.

countTokens(BoardTable, 'X', Total) :-
	count(BoardTable, 'X', TempO1),
	count(BoardTable, '%', TempO2),
	Total is TempO1 + TempO2.


%countTableToken(TeaToken, Table, InitCount, Total):-

replace(New,0,[_|OldList],[New|OldList]).
replace(New,Index,[Head|OldList],[Head|NewList]):-
	Index > 0,
	Index1 is Index-1,
	replace(New,Index1,OldList,NewList).


applyRotation(Table, NRotations, NewTable) :-
	applyRotation(Table, Table, NRotations, NewTable, 1).

applyRotation(Table, TableCopy, NRotations, NewTable, Index) :-
	Index \= 9,
	FinalIndex is ((Index + NRotations) mod 8),
	Index1 is Index + 1,
	at(Elem, Index, TableCopy),
	rotate(Table, Elem, FinalIndex, NewTable1),
	applyRotation(NewTable1, TableCopy, NRotations, NewTable, Index1).

applyRotation(Table, _, _, NewTable, 9) :-
	assignValue(Table, NewTable).

%Needed because the 0 position does not rotate
rotate(Table, Elem, 0, NewTable) :-
	replace(Elem, 8, Table, NewTable).
rotate(Table, Elem, FinalIndex, NewTable) :-
	FinalIndex \= 0,
	replace(Elem, FinalIndex, Table, NewTable).
