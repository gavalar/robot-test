"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveRobot = moveRobot;
const readline = __importStar(require("readline"));
/**
 * Valid Directions
 */
const VALID_DIRECTIONS = [
    'forward',
    'left',
    'right',
    'backward'
];
/**
 *  Used for mapping heading changes when turning
 */
const LEFT_TURN = {
    north: 'west',
    west: 'south',
    south: 'east',
    east: 'north',
};
const RIGHT_TURN = {
    north: 'east',
    east: 'south',
    south: 'west',
    west: 'north',
};
/**
 * Move Map - How each heading moves (change in coordinates) depending on current robot direction
 */
const MOVE_MAP = {
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
function getArenaBounds(corner1, corner2) {
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
function hasRobotCrashed(location, arenaBounds) {
    return (location.x >= arenaBounds.minX &&
        location.x <= arenaBounds.maxX &&
        location.y >= arenaBounds.minY &&
        location.y <= arenaBounds.maxY);
}
/**
 * Checks if the instruction to the robot is valid
 *
 * @param direction: Direction
 * @return boolean
 */
function isValidDirection(direction) {
    return VALID_DIRECTIONS.includes(direction);
}
/**
 * Moves the robot in the direction and updates it's location
 *
 * @param heading: Heading
 * @param location: Coordinate
 * @param movement: Movement
 * @return Coordinate
 */
function updateRobotLocation(heading, location, movement) {
    // Update the move map depending on which direction the robot is facing
    const move = MOVE_MAP[heading];
    let muliplier = 1;
    if (movement == 'backward') {
        muliplier = -1;
    }
    // Update location to see if the robot can move using the current location and the move map
    const newLocation = { x: location.x + (move.x * muliplier), y: location.y + (move.y * muliplier) };
    return newLocation;
}
/**
 * Move the Robot following the path
 *
 * @param request: validRequest
 * @return Response JSON
 */
function moveRobot(request) {
    // Create the arena for the robot to move in
    const arenaBounds = getArenaBounds(request.arena.corner1, request.arena.corner2);
    // Setup the robot location and heading
    let location = Object.assign({}, request.location);
    let heading = request.heading;
    // Setup the path taken return array
    const path = [];
    // Follow the directions for as long as the robot is able to move
    for (let direction of request.directions) {
        // Add the new direction to the path taken array
        let repetition = 1;
        // Check if the direction has a repetition
        if (!isValidDirection(direction)) {
            // check for a number in in brackets
            const match = direction.match(/^(\w+)\((\d+)\)$/);
            if ((match === null || match === void 0 ? void 0 : match.length) == 3) {
                const number = parseInt(match[2]);
                if (typeof number === 'number' && !isNaN(number)) {
                    repetition = number;
                    direction = match[1];
                }
            }
        }
        // Check if the direction is valid before attempting to move
        if (!isValidDirection(direction)) {
            path.push(direction);
            return {
                status: 'error',
                location,
                heading,
                path,
            };
        }
        for (let i = 0; i < repetition; i++) {
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
                    const newLocation = updateRobotLocation(heading, location, direction);
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
            const request = JSON.parse(inputString);
            const response = moveRobot(request);
            // Display the output
            console.log(JSON.stringify(response));
        }
        catch (e) {
            // If parsing fails, output generic error
            console.error(JSON.stringify({ status: 'error', message: 'Invalid input JSON' }));
        }
    });
}
if (require.main === module) {
    run();
}
//# sourceMappingURL=index.js.map