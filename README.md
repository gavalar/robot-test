# Technical Exercise

## Scenario

We have a robot in an arena. The robot can move forward, turn left, or turn right. The robot turns on the spot. It moves one unit at a time.

We can tell the robot where it is in the arena using coordinates. And we can tell it the direction it is facing. As the robot moves it knows where it is in the arena & which direction it is facing.

We can give the robot a sequence of movements that it will follow along a path. For example, we could tell it to move forward, turn left, move forward. If the robot encounters a movement it does not understand it errors & goes no further.

The arena is square and of limited size. If the robot runs into the walls of the arena it crashes & goes no further.

## Constraints

The robot should read JSON input from stdin. The input will contain the following fields:

- `arena` will be two coordinates defining opposite corners of the arena
- `location` will be coordinates of the robot
- `heading` will be one of `north`, `south`, `east`, `west`
- `directions` will be an arbitrary length array containing movement commands: `forward`, `left`, `right`

Coordinates are always a structure with `x` and `y` fields. Both these fields contain integers.

We expect the robot to output JSON to stdout. The output will contain the following fields:

- `status` will be either `ok`, `error`, or `crash`
- `location` will be the final location coordinates of the robot having followed the `input` path
- `heading` will be the heading of the robot at the end of its path or the point of crashing
- `path` will be the path the robot took to its final point

In the case of an `error` or a `crash`, then the last movement in the `path` should be the one that caused the situation.
