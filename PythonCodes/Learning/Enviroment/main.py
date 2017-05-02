import SarsaLearning
import Enviroment

learn = SarsaLearning.SarsaLearning(Enviroment.HanoiEnv(3))

learn.compute_q()