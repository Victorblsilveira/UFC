# move = (OriginPeg, DestinyPeg)
# state = [Peg1[],Peg2[],Peg3[]]

import copy
import itertools


class HanoiEnv:

    def __init__(self, n=3, p=3):
        self.p = p
        self.n = n
        self.actions = list(itertools.permutations(range(self.n), 2))

        initial_state = list()
        initial_state.append([x for x in range(0, n)][::-1])

        for x in range(0, p - 1):
            initial_state.append(list())

        self.state = initial_state
        # sprint initial_state

    def allowed_moves(self, state):
        moves = list()
        for x in range(len(state)):
            for y in range(x, len(state)):
                if self.state[x] and self.state[y]:
                    if self.state[x][-1] > self.state[y][-1]:
                        moves.append((y, x))
                    elif x != y:
                        moves.append((x, y))
                elif self.state[y]:
                    moves.append((y, x))
                elif self.state[x]:
                    moves.append((x, y))

        return moves

    def move_allowed(self, move):
        disc_from = move[0]
        disc_to = move[1]

        if self.state[disc_from]:
            if self.state[disc_to]:
                return self.state[disc_to][-1] > self.state[disc_from][-1]
            else:
                return True
        else:
            return False

    def get_state(self):
        return str(self.state)

    def get_moved_state(self, move, modify=True):
        state_to_show = copy.copy(self.state)
        reward = 0
        if self.move_allowed(move):
            if modify:
                self.state[move[1]].append(self.state[move[0]].pop())
                state_to_show = copy.copy(self.state)

            else:
                copy_state = copy.copy(self.state)
                copy_state[move[1]].append(copy_state[move[0]].pop())
                state_to_show = copy_state
        else:
            reward = -100

        if self.finished_state(state_to_show):
            reward = 10000
        elif 0 == reward:
            reward = -5

        return str(state_to_show), reward

    def finished_state(self, state):
        if state[self.n - 1] == [x for x in range(0, self.n)][::-1]:
            return True
        return False

    def finished(self):
        if self.state[self.n - 1] == [x for x in range(0, self.n)][::-1]:
            return True
        return False

    def restart(self):
        initial_state = list()
        initial_state.append([x for x in range(0, self.n)][::-1])
        for x in range(0, self.p - 1):
            initial_state.append(list())
        self.state = initial_state
        # print "restarted with state of : "+str(self.state)
