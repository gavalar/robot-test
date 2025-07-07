import * as readline from 'readline';

/**
 * Setup the Coordiante type
 */
type Coordinate = {
  x: number;
  y: number;
};

/**
 *  Valid Headings
 */
type Heading = 'north' | 'south' | 'east' | 'west';

/**
 *  Valid Directions
 */
type Direction = 'forward' | 'left' | 'right' | 'backward';

/**
 * Valid Movements
 */
type Movement = 'forward' | 'backward';

/**
 * Valid Input JSON structure
 */
interface validRequest {
  arena: {
    corner1: Coordinate;
    corner2: Coordinate;
  };
  location: Coordinate;
  heading: Heading;
  directions: string[];
}

/**
 * Valid Output JSON structure
 */
interface Response {
  status: 'ok' | 'error' | 'crash';
  location: Coordinate;
  heading: Heading;
  path: string[];
}

/**
 * Valid Directions
 */
const VALID_DIRECTIONS: Direction[] = ['forward', 'left', 'right', 'backward'];

/**
 *  Used for mapping heading changes when turning
 */
const LEFT_TURN: Record<Heading, Heading> = {
  north: 'west',
  west: 'south',
  south: 'east',
  east: 'north',
};
const RIGHT_TURN: Record<Heading, Heading> = {
  north: 'east',
  east: 'south',
  south: 'west',
  west: 'north',
};

/**
 * Move Map - How each heading moves (change in coordinates) depending on current robot direction
 */
const MOVE_MAP: Record<Heading, Coordinate> = {
  north: { x: 0, y: 1 },
  south: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

/**
 * Use the coordinates to get the Min / Max values of the arena
 *
 * @param corner1: Coordinate
 * @param corner2: Coordinate
 * @return object getArenaBounds
 */
function getArenaBounds(corner1: Coordinate, corner2: Coordinate) {
  return {
    minX: Math.min(corner1.x, corner2.x),
    maxX: Math.max(corner1.x, corner2.x),
    minY: Math.min(corner1.y, corner2.y),
    maxY: Math.max(corner1.y, corner2.y),
  };
}

/**
 *  Check if the robot location is inside the the arena
 *
 * @param location: Coordinate
 * @param arenaBounds: getArenaBounds
 * @return boolean
 */
function hasRobotCrashed(location: Coordinate, arenaBounds: ReturnType<typeof getArenaBounds>): boolean {
  return (
    location.x >= arenaBounds.minX &&
    location.x <= arenaBounds.maxX &&
    location.y >= arenaBounds.minY &&
    location.y <= arenaBounds.maxY
  );
}

/**
 * Checks if the instruction to the robot is valid
 *
 * @param direction: Direction
 * @return boolean
 */
function isValidDirection(direction: string): direction is Direction {
  return VALID_DIRECTIONS.includes(direction as Direction);
}

/**
 * Moves the robot in the direction and updates it's location
 *
 * @param heading: Heading
 * @param location: Coordinate
 * @param movement: Movement
 * @return Coordinate
 */
function updateRobotLocation(heading: Heading, location: Coordinate, movement: Movement): Coordinate {
  // Update the move map depending on which direction the robot is facing
  const move: Coordinate = MOVE_MAP[heading];
  let muliplier = 1;
  if (movement == 'backward') {
    muliplier = -1;
  }

  // Update location to see if the robot can move using the current location and the move map
  const newLocation: Coordinate = { x: location.x + move.x * muliplier, y: location.y + move.y * muliplier };

  return newLocation;
}

/**
 * Move the Robot following the path
 *
 * @param request: validRequest
 * @return Response JSON
 */
function moveRobot(request: validRequest): Response {
  // Create the arena for the robot to move in
  const arenaBounds = getArenaBounds(request.arena.corner1, request.arena.corner2);

  // Setup the robot location and heading
  let location = { ...request.location };
  let heading = request.heading;

  // Setup the path taken return array
  const path: string[] = [];

  // Follow the directions for as long as the robot is able to move
  for (let direction of request.directions) {
    let repetition = 1;
    // Check if the direction has a repetition
    if (!isValidDirection(direction)) {
      // check for a number in in brackets
      const match = direction.match(/^(\w+)\((\d+)\)$/);

      if (match?.length == 3) {
        const number = parseInt(match[2]);
        if (typeof number === 'number' && !isNaN(number)) {
          repetition = number;
          direction = match[1];
        }
      }
    }

    // Re-check if the direction is valid before attempting to move
    if (!isValidDirection(direction)) {
      // Add the new direction to the path taken array
      path.push(direction);
      return {
        status: 'error',
        location,
        heading,
        path,
      };
    }

    // Loop over the repetition and complete the given command
    for (let i = 0; i < repetition; i++) {
      // Add the new direction to the path taken array
      path.push(direction);

      switch (direction) {
        case 'left': {
          heading = LEFT_TURN[heading];
          break;
        }
        case 'right': {
          heading = RIGHT_TURN[heading];
          break;
        }
        case 'backward':
        case 'forward': {
          // Update the robot location
          const newLocation: Coordinate = updateRobotLocation(heading, location, direction);

          // Check if the robot has crashed
          if (!hasRobotCrashed(newLocation, arenaBounds)) {
            return {
              status: 'crash',
              location,
              heading,
              path,
            };
          }

          // Update robot with it's new location
          location = newLocation;
          break;
        }
      }
    }
  }

  // Path was completed successfully
  return {
    status: 'ok',
    location,
    heading,
    path,
  };
}

/**
 * Move the robot in the space given by the JSON input
 *
 * @return JSON (display to console)
 */
function run() {
  let inputString = '';

  // Read stdin
  const stdin = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  // Itterate on the JSON input and add it to a localised var
  stdin.on('line', (line) => {
    inputString += line;
  });

  // After reading all of the content from the input check validity of input and move robot
  stdin.on('close', () => {
    try {
      const request: validRequest = JSON.parse(inputString);
      const response = moveRobot(request);

      // Display the output
      console.log(JSON.stringify(response));
    } catch (e) {
      // If parsing fails, output generic error
      console.error(JSON.stringify({ status: 'error', message: 'Invalid input JSON' }));
    }
  });
}

if (require.main === module) {
  run();
}
export { moveRobot };
