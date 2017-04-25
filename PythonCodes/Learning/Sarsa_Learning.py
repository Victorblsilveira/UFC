import random

import numpy as np

from Enviroment import Hanoi_Env

class Sarsa_Learning:


    def __init__(self, gamma=0.8, alpha=1.0, N=10000):
        self.gamma = gamma
        self.alpha = alpha
        self.N_episodes = N

    def computeQ(self):
        # Initialize the Q matrix 16(rows)x4(columns)
        Q = np.zeros([env.observation_space.n, env.action_space.n])

        for i in range(env.observation_space.n):
            if (i != 5) and (i != 7) and (i != 11) and (i != 12) and (i != 15):
                for j in range(env.action_space.n):
                    Q[i, j] = np.random.rand()

        # Epsilon-Greedy policy, given a state the agent chooses the action that it believes has the best long-term effect with probability 1-eps, otherwise, it chooses an action uniformly at random. Epsilon may change its value.

        bestreward = 0
        epsilon = 0.1
        discount = 0.99
        learning_rate = 0.1
        a = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]



        for i_episode in range(self.N_episodes):

            number_of_discs = 3
            number_of_pegs = 3

            initial_state = list(list([x for x in range(0,number_of_discs)]).sort().reverse())

            for x in range(0,number_of_pegs):
                initial_state.append(list([0 for y in range(0,number_of_discs)]))

            tower = Hanoi_Env(initial_state)

            currentState = tower.get_state()

            # Select action a using a policy based on Q
            if np.random.rand() <= epsilon:  # pick randomly
                currentAction = random.randint(0, env.action_space.n - 1)
            else:  # pick greedily
                currentAction = np.argmax(Q[currentState, :])

            totalreward = 0
            while True:
                env.render()

                # Carry out an action a
                observation, reward, done, info = env.step(currentAction)
                if done is True:
                    break;

                # Observe reward r and state s'
                totalreward += reward
                nextState = observation

                # Select action a' using a policy based on Q
                if np.random.rand() <= epsilon:  # pick randomly
                    nextAction = random.randint(0, env.action_space.n - 1)
                else:  # pick greedily
                    nextAction = np.argmax(Q[nextState, :])

                # update Q with Q-learning
                Q[currentState, currentAction] += learning_rate * (
                reward + discount * Q[nextState, nextAction] - Q[currentState, currentAction])

                currentState = nextState
                currentAction = nextAction

                print "Episode: %d reward %d best %d epsilon %f" % (i_episode, totalreward, bestreward, epsilon)
                if totalreward > bestreward:
                    bestreward = totalreward
                if i_episode > self.N_episodes / 2:
                    epsilon = epsilon * 0.9999
                if i_episode >= self.N_episodes - 10:
                    a.insert(0, totalreward)
                    a.pop()
                print a

                for i in range(env.observation_space.n):
                    print "-----"
                    for j in range(env.action_space.n):
                        print Q[i, j]
        pass