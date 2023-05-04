import json
import random

N = 12

weights = {"weights": []}
for x in range(N):
    weights["weights"].append([])
    for i in range(N):
        weights["weights"][x].append(random.randint(1,100))

print(weights)

with open("weights3.json", "w") as f:
    f.write(json.dumps(weights))
