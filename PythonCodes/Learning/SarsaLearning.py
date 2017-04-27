import random
import numpy as np
from Enviroment import HanoiEnv


class SarsaLearning:
    def __init__(self, gamma=0.8, alpha=1.0, n=10000):
        self.gamma = gamma
        self.alpha = alpha
        self.n_episodes = n

    def compute_q(self):

        tower = HanoiEnv.HanoiEnv(3)

        Q = dict()

        current_state = tower.get_state()

        Q[current_state] = dict()
        for x in tower.actions:
            Q[current_state][x] = 0

        epsilon = 0.1
        discount = 0.99
        learning_rate = 0.1

        for i_episode in range(self.n_episodes):

            number_of_moves = 0

            # Select action a using a policy based on Q
            moves = tower.actions
            if np.random.rand() <= epsilon:  # pick randomly
                current_action = random.randint(0, len(moves) - 1)
            else:  # pick greedily
                current_action = np.argmax(Q[current_state].values())

            totalreward = 0
            # print moves
            while not tower.finished():

                number_of_moves = number_of_moves + 1
                # Carry out an action a
                print(current_state)
                next_state, reward = tower.get_moved_state(tower.actions[current_action])
                print(current_state)
                # Observe reward r and state s'
                totalreward += reward

                # Creating or not an state on Q
                if next_state not in Q.keys():
                    Q[next_state] = dict()
                    for x in moves:
                        Q[next_state][x] = 0

                # Select action a' using a policy based on Q
                if np.random.rand() <= epsilon:  # pick randomly
                    next_action = random.randint(0, len(moves) - 1)
                else:  # pick greedily
                    next_action = np.argmax(Q[next_state].values())

                Q[current_state][tower.actions[current_action]] += learning_rate * (
                    reward + discount * Q[next_state][tower.actions[next_action]] - Q[current_state][
                        tower.actions[current_action]])

                # print(currentState)
                # print(moves[currentAction])
                # print(nextState)
                # print(moves[nextAction])
                # print Q

                current_state = next_state
                current_action = next_action
                if number_of_moves > 4:
                    break
            tower.restart()
            print(number_of_moves)
            break
