import json
import random

N = 7

weights = {"weights": []}
for x in range(N):
    weights["weights"].append([])
    for i in range(N):
        if (x == i):
            weights["weights"][x].append(0)
        else:
            weights["weights"][x].append(random.randint(1,100))

print(weights)

with open(f"weights_{N}.json", "w") as f:
    f.write(json.dumps(weights))
