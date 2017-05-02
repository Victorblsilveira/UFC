import random
import numpy as np

class SarsaLearning:

    def __init__(self, env, gamma=0.8, alpha=1.0, n=10000):
        self.gamma = gamma
        self.alpha = alpha
        self.n_episodes = n
        self.env = env

    def change_ep_number(self, number):
        self.n = number

    def change_learning_rate(self, number):
        self.gamma = number

    def get_ep_number(self):
        return self.n_episodes

    def get_learning_rate(self):
        return self.gamma

    def compute_q(self):

        Q = dict()

        current_state = self.env.get_state()

        Q[current_state] = dict()
        for x in self.env.actions:
            Q[current_state][x] = np.random.rand()

        epsilon = 0.1
        discount = 0.99
        learning_rate = 0.2

        for i_episode in range(self.n_episodes):

            number_of_moves = 0

            # Select action a using a policy based on Q
            moves = self.env.actions
            if np.random.rand() <= epsilon:  # pick randomly
                current_action = random.randint(0, len(moves) - 1)
            else:  # pick greedily
                current_action = np.argmax(Q[current_state].values())

            #totalreward = 0
            # print moves
            while not self.env.finished():

                number_of_moves = number_of_moves + 1
                # Carry out an action a
                next_state, reward = self.env.get_moved_state(self.env.actions[current_action])

                # Observe reward r and state s'
                # totalreward += reward

                # Creating or not a state on Q
                if next_state not in Q.keys():
                    Q[next_state] = dict()
                    for x in moves:
                        Q[next_state][x] = np.random.rand()

                # Select action a' using a policy based on Q
                if np.random.rand() <= epsilon:  # pick randomly
                    next_action = random.randint(0, len(moves) - 1)
                else:  # pick greedily
                    next_action = np.argmax(Q[next_state].values())

                # Q[current_state][tower.actions[current_action]] += learning_rate * (
                #     reward + discount * Q[next_state][tower.actions[next_action]] -
                #     Q[current_state][tower.actions[current_action]])
                Q[current_state][self.env.actions[current_action]] = (1-learning_rate)*Q[current_state][self.env.actions[current_action]]+(
                    learning_rate * (reward + discount * Q[next_state][self.env.actions[next_action]]))
                # print(currentState)
                # print(moves[currentAction])
                # print(nextState)
                # print(moves[nextAction])
                # print Q
                current_state = next_state
                current_action = next_action
                # if number_of_moves > 4:
                #     break

            self.env.restart()
            current_state = self.env.get_state()
            print(number_of_moves)
            # print(Q)
            # break
