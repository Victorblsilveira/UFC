#move = (OriginPeg, DestinyPeg)
#pegs = [Peg1[],Peg2[],Peg3[]]
import copy
from itertools import permutations, combinations
class Hanoi_Env:

    pegs = list()
    n = 0

    def __init__(self,state):
        for i in state:
            if self.pegs[i]:
                self.pegs[i] = state[i]
            else:
                self.pegs.insert(i,state[i])
        self.n = len(self.pegs[0]) + len(self.pegs[1]) + len(self.pegs[2])
        self.actions = list(permutations(range(self.n),2))

    def allowed_moves(self, state):
        moves = list()

        for x in range(len(state)-1):
            for y in range(x,len(state)):
                if self.pegs[x] > self.pegs[y]:
                    moves.append((y,x))
                elif x!=y :
                    moves.append((x,y))
        return moves

    def move_allowed(self,move):
        disc_from = move[0]
        disc_to = move[1]

        if self.pegs(disc_from):
            return (self.pegs(disc_to)[-1] > self.pegs(disc_from)[-1]) if self.pegs(disc_from) else True
        else:
            return False

    def get_state(self):
        return self.pegs

    def get_moved_state(self,move,modify=True):

        if self.move_allowed(move):
            if modify:
                self.pegs(move[1]).append(self.pegs(move[0]).pop())
                return [x for x in self.pegs]

            else:
                copyPegs = copy.copy(self.pegs)
                copyPegs.pegs(move[1]).append(copyPegs.pegs(move[0]).pop())
                return [x for x in copyPegs.pegs]

        return self.pegs
        #state = [self.pegs[0],self.pegs[1],self.pegs[2]]
        #state = [x for x in self.pegs]

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