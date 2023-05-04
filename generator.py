import json
import random

N = 13

weights = {"weights": []}
for x in range(N):
    weights["weights"].append([])
    for i in range(N):
        if (x == i):
            weights["weights"][x].append(0)
        weights["weights"][x].append(random.randint(1,100))

print(weights)

with open("weights.json", "w") as f:
    f.write(json.dumps(weights))
