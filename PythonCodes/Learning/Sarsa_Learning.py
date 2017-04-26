import random
import copy
import numpy as np
import operator
from Enviroment import Hanoi_Env

class Sarsa_Learning:


    def __init__(self, gamma=0.8, alpha=1.0, N=10000):
        self.gamma = gamma
        self.alpha = alpha
        self.N_episodes = N

    def computeQ(self):

        tower = Hanoi_Env.Hanoi_Env(3)

        Q = dict()

        stateIdentifier = str(tower.get_state())

        Q[stateIdentifier] = dict()
        for x in tower.actions:
            Q[stateIdentifier][x] = 0

        epsilon = 0.1
        discount = 0.99
        learning_rate = 0.1


        for i_episode in range(self.N_episodes):

            number_of_moves = 0

            currentState = tower.get_state()

            # Select action a using a policy based on Q
            moves = tower.actions
            if np.random.rand() <= epsilon:  # pick randomly
                currentAction = random.randint(0, len(moves)-1)
            else:  # pick greedily
                currentAction = np.argmax(Q[str(currentState)].values())

            totalreward = 0
            #print moves
            while not tower.finished(currentState):

                number_of_moves = number_of_moves +1
                # Carry out an action a
                print currentState
                nextState, reward = tower.get_moved_state(tower.actions[currentAction])
                print currentState
                # Observe reward r and state s'
                totalreward += reward

                #Creating or not an state on Q
                stateIdentifier = str(nextState)
                if not stateIdentifier in Q.keys():
                    Q[stateIdentifier] = dict()
                    for x in moves:
                        Q[stateIdentifier][x] = 0

                # Select action a' using a policy based on Q
                if np.random.rand() <= epsilon:  # pick randomly
                    nextAction = random.randint(0, len(moves)-1)
                else:  # pick greedily
                    nextAction = np.argmax(Q[str(nextState)].values())


                Q[str(currentState)][tower.actions[currentAction]] += learning_rate * (
                    reward + discount * Q[str(nextState)][tower.actions[nextAction]] - Q[str(currentState)][tower.actions[currentAction]])

                # print(currentState)
                # print(moves[currentAction])
                # print(nextState)
                # print(moves[nextAction])
                # print Q

                currentState = copy.copy(nextState)
                currentAction = copy.copy(nextAction)
                if number_of_moves > 4:
                    break;
            tower.restart()
            break;
            print number_of_moves