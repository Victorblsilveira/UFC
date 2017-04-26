import random

import numpy as np

from Enviroment import Hanoi_Env

class Sarsa_Learning:


    def __init__(self, gamma=0.8, alpha=1.0, N=10000):
        self.gamma = gamma
        self.alpha = alpha
        self.N_episodes = N

    def computeQ(self):

        tower = Hanoi_Env.Hanoi_Env(3)
        Q = dict()
        # Initialize the Q matrix 16(rows)x4(columns)
        stateIdentifier = str(tower.get_state())
        Q[stateIdentifier] = dict()
        for x in tower.actions:
            Q[stateIdentifier][x] = 0

        # for i in range(env.observation_space.n):
        #     if (i != 5) and (i != 7) and (i != 11) and (i != 12) and (i != 15):
        #         for j in range(env.action_space.n):
        #             Q[i, j] = np.random.rand()

        # Epsilon-Greedy policy, given a state the agent chooses the action that it believes has the best long-term effect with probability 1-eps, otherwise, it chooses an action uniformly at random. Epsilon may change its value.

        bestreward = 0
        epsilon = 0.1
        discount = 0.99
        learning_rate = 0.1
        a = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        #print "Estado inicial de Q : " + str(Q)

        for i_episode in range(self.N_episodes):
            number_of_moves = 0
            currentState = tower.get_state()

            # Select action a using a policy based on Q
            moves = tower.actions
            if np.random.rand() <= epsilon:  # pick randomly
                currentAction = random.randint(0, len(moves)-1)
            else:  # pick greedily
                currentAction = np.argmax(Q[str(currentState)])

            #print "Primeira acao : "+str(moves[currentAction])
            totalreward = 0

            while not tower.finished(currentState) :
                number_of_moves = number_of_moves +1
                # Carry out an action a
                nextState, reward = tower.get_moved_state(tower.actions[currentAction])

                #print "Proximo estado :"+str(nextState)
                # Observe reward r and state s'
                totalreward += reward

                #Creating or not an state on Q
                stateIdentifier = str(nextState)
                if not stateIdentifier in Q.keys():
                    Q[stateIdentifier] = dict()
                    for x in tower.actions:
                        Q[stateIdentifier][x] = 0

                # Select action a' using a policy based on Q
                moves = tower.actions
                if np.random.rand() <= epsilon:  # pick randomly
                    nextAction = random.randint(0, len(moves)-1)
                else:  # pick greedily
                    nextAction = np.argmax(Q[str(nextState)])

                #print Q[str(currentState)]
                # update Q with Q-learning
                #print ("Proxima acao :"+str(nextAction))
                #print(nextState)
                #print Q[str(nextState)][tower.actions[nextAction]]
                #print Q[str(currentState)][tower.actions[currentAction]]
                Q[str(currentState)][tower.actions[currentAction]] += learning_rate * (
                    reward + discount * Q[str(nextState)][tower.actions[nextAction]] - Q[str(currentState)][tower.actions[currentAction]])

                currentState = nextState
                currentAction = nextAction
                # print ("Episode: %d reward %d best %d epsilon %f" % (i_episode, totalreward, bestreward, epsilon))
                # if totalreward > bestreward:
                #     bestreward = totalreward
                # if i_episode > self.N_episodes / 2:
                #     epsilon = epsilon * 0.9999
                # if i_episode >= self.N_episodes - 10:
                #     a.insert(0, totalreward)
                #     a.pop()
                # print (a)

                # for i in range(env.observation_space.n):
                #     print "-----"
                #     for j in range(len(tower.actions)):
                #         print Q[i, j]
            tower.restart()
            print number_of_moves