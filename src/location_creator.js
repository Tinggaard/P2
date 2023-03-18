const location = {
  place: '',
  lat: 0,
  lon: 0,
};

const all_locations = [];

function getRandomInt(min, max) {
  let number = Math.random() * (max - min + 1) + min;
  number = parseFloat(number.toFixed(6));
  return number;
}

for (let i = 0; i < 5; i++) {
  const placer = Object.create(location);
  placer.place = `place${i}`;
  placer.lat = getRandomInt(50, 80);
  placer.lon = getRandomInt(10, 20);
  all_locations.push(placer);
}

const EARTH_RADIUS = 6372797;
const DEGREES_RADIANS = Math.PI / 180;

function calc_distance(location2, location) {
  const lat1 = location.lat * DEGREES_RADIANS;
  const lon1 = location.lon * DEGREES_RADIANS;
  const lat2 = location2.lat * DEGREES_RADIANS;
  const lon2 = location2.lon * DEGREES_RADIANS;

  const sin_lat = Math.pow(Math.sin(0.5 * (lat2 - lat1)), 2);
  const cos_lat = Math.cos(lat1) * Math.cos(lat2);
  const lon = Math.pow(Math.sin(0.5 * (lon2 - lon1)), 2)
  const haversin = sin_lat + (cos_lat * lon);

  const minimum = Math.sqrt(haversin) < 1.0 ? Math.sqrt(haversin) : 1.0;
  const distance = 2 * EARTH_RADIUS * Math.asin(minimum);

  return distance;
}

const distances = [];

for (let i = 0; i < all_locations.length; i++) {
  distances[i] = [];
  for (let j = 0; j < all_locations.length; j++) {
    const distance = calc_distance(all_locations[j], all_locations[i]);
    distances[i][j] = distance;
  }
}

function generateCycles(start, remaining) {
  if (remaining.length === 0) {
    return [[]];
  }
  const cycles = [];
  for (const next of remaining) {
    const rest = remaining.filter(loc => loc !== next);
    for (const subcycle of generateCycles(next, rest)) {
      cycles.push([start, ...subcycle]);
    }
  }
  return cycles;
}


// Generate all possible Hamiltonian cycles
const all_cycles = [];
for (const location of all_locations) {
  console.log("test")    
  const remaining = all_locations.filter(loc => loc !== location);
  const cycles = generateCycles(location, remaining);
  for (const cycle of cycles) {
    all_cycles.push(cycle);
  }
}

function calculateCycleWeight(cycle) {
  let weight = 0;
  for (let i = 0; i < cycle.length - 1; i++) {
    const currentLocationIndex = all_locations.indexOf(cycle[i]);
    const nextLocationIndex = all_locations.indexOf(cycle[i + 1]);
    const distance = distances[currentLocationIndex][nextLocationIndex];
    weight += distance;
  }
  // Add distance from last location back to the first location
  const firstLocationIndex = all_locations.indexOf(cycle[0]);
  const lastLocationIndex = all_locations.indexOf(cycle[cycle.length - 1]);
  weight += distances[lastLocationIndex][firstLocationIndex];

  return weight;
}

// Find the shortest Hamiltonian cycle
let shortestCycle = all_cycles[0];
let shortestWeight = calculateCycleWeight(shortestCycle);

for (const cycle of all_cycles) {
  const weight = calculateCycleWeight(cycle);
  if (weight < shortestWeight) {
    shortestWeight = weight;
    shortestCycle = cycle;
  }
}

console.log("Shortest Hamiltonian Cycle:");
const shortestCyclePlaces = shortestCycle.map(location => location.place);
console.log(shortestCyclePlaces);
console.log("Cycle weight: " + shortestWeight.toFixed(2));
