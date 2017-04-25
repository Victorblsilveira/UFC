


class Hanoi_Env:

    pegs = list(3)
    n = 0

    def __init__(self,state):
        self.pegs[0] = state[0]
        self.pegs[1] = state[1]
        self.pegs[2] = state[2]
        self.n = len(self.pegs[0]) + len(self.pegs[1]) + len(self.pegs[2])

    def allowed_moves(self,state):
        pass

    def move_allowed(self,move):
        disc_from = move[0]
        disc_to = move[1]

        if self.pegs(disc_from):
            return (self.pegs(disc_to)[-1] > self.pegs(disc_from)[-1]) if self.pegs(disc_from) else True
        else:
            return False

    def discs_on_peg(self,peg):
        pass

    def get_moved_state(self,move):
        pass


