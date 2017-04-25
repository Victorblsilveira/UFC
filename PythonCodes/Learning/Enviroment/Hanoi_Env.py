#move = (OriginPeg, DestinyPeg)
#state = [Peg1[],Peg2[],Peg3[]]
import copy

import itertools

class Hanoi_Env:

    def __init__(self,n=3,p=3):

        self.n = n
        self.actions = list(itertools.permutations(range(self.n), 2))

        initial_state = list(list([x for x in range(0,n)]).sort().reverse())

        for x in range(0, p):
            initial_state.append(list())

        self.final_state = initial_state.reverse()
        self.state = initial_state

    def allowed_moves(self, state):
        moves = list()

        for x in range(len(state)-1):
            for y in range(x,len(state)):
                if self.state[x][-1] > self.state[y][-1]:
                    moves.append((y,x))
                elif x!=y :
                    moves.append((x,y))
        return moves
    #
    # def move_allowed(self,move):
    #     disc_from = move[0]
    #     disc_to = move[1]
    #
    #     if self.pegs(disc_from):
    #         return (self.pegs(disc_to)[-1] > self.pegs(disc_from)[-1]) if self.pegs(disc_from) else True
    #     else:
    #         return False

    def get_state(self):
        return copy.copy(self.state)

    def get_moved_state(self,move,modify=True):
        stateToshow = None
        if self.move_allowed(move):
            if modify:
                self.state[move[1]].append(self.state[move[0]].pop())
                stateToshow = copy.copy(self.state)

            else:
                copyState = copy.copy(self.state)
                copyState[move[1]].append(copyState[move[0]].pop())
                stateToshow = copyState

        if self.finished(stateToshow):
            reward = 10000
        else:
            reward = -10

        return self.state,reward
        #state = [self.pegs[0],self.pegs[1],self.pegs[2]]
        #state = [x for x in self.pegs]

    def finished(self,state):
        if state == self.final_state :
            return True
        return False
    # def rewardMatrix(self):
    #     actions = list(permutations(range(3),2))
    #     states =
    #     R = list()
    #     for state in states :
    #         tower = Hanoi_Env(state)
    #         for move in actions :
    #             if tower.move_allowed(move):
    #                 next_state = tower.get_moved_state()
    #                 R[state][next_state] = -5
    #     pass