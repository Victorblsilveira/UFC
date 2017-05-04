import random
import numpy as np


class SarsaLearning:
    def __init__(self, env, gamma=0.8, alpha=0.99, n=50000):
        self.gamma = gamma
        self.alpha = alpha
        self.n_episodes = n
        self.env = env
        self.q = dict()

    def change_ep_number(self, number):
        self.n_episodes = number

    def change_learning_rate(self, number):
        self.gamma = number

    def get_ep_number(self):
        return self.n_episodes

    def get_learning_rate(self):
        return self.gamma

    def play(self):
        moves = 0
        totalreward = 0
        self.env.restart()
        current_state = self.env.get_state()
        print("Jogando")
        while not self.env.finished():
            action = max(self.q[current_state], key=lambda i: self.q[current_state][i])
            print (current_state)
            print (action)
            current_state, reward = self.env.get_moved_state(action)
            moves = moves + 1
            totalreward += reward
        print("Jogo terminado com "+str(moves)+" jogadas e pontuacao de "+str(totalreward))

    def compute_q(self):

        current_state = self.env.get_state()

        self.q[current_state] = dict()
        for x in self.env.actions:
            self.q[current_state][x] = np.random.rand()

        epsilon = 0.1

        for i_episode in range(self.n_episodes):

            number_of_moves = 0

            # Select action a using a policy based on Q
            moves = self.env.actions
            if np.random.rand() <= epsilon:  # pick randomly
                current_action = moves[random.randint(0, len(moves) - 1)]
            else:  # pick greedily
                current_action = max(self.q[current_state], key=lambda i: self.q[current_state][i])

            while not self.env.finished():
                number_of_moves = number_of_moves + 1
                # Carry out an action a
                next_state, reward = self.env.get_moved_state(current_action)

                # Creating or not a state on Q
                if next_state not in self.q:
                    self.q[next_state] = dict()
                    for x in moves:
                        self.q[next_state][x] = np.random.rand()

                # Select action a' using a policy based on Q
                if np.random.rand() <= epsilon:  # pick randomly
                    next_action = moves[random.randint(0, len(moves) - 1)]
                else:  # pick greedily
                    next_action = max(self.q[next_state], key=lambda i: self.q[next_state][i])

                self.q[current_state][current_action] = self.gamma * self.q[current_state][current_action] + (
                    (1-self.gamma) * (reward + self.alpha * self.q[next_state][next_action]))

                current_state = next_state
                current_action = next_action

            self.env.restart()
            current_state = self.env.get_state()
            print(number_of_moves)
        self.save_q()

    def save_q(self):
        with open("Q_matrix.txt", 'w') as f:
            for x in self.q:
                f.write(str(x))
                for y in self.q[x]:
                    f.write("\t"+str(y)+" ")
                    f.write(str(self.q[x][y]))
                f.write("\n")
