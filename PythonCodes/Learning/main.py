import SarsaLearning as Learn
from Enviroment import HanoiEnv as Env

learn = Learn.SarsaLearning(Env.HanoiEnv(8))

learn.compute_q()

learn.play()