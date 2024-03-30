const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;

// Configuration Variables for Maze
const width = window.innerWidth, height = window.innerHeight;
const cellsHorizontal = 10, cellsVertical = 7;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: width,
        height: height,
        wireframes: false
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);


// Walls or Borders of Canvas
const walls = [
    Bodies.rectangle(width/2, 0, width, 10, {isStatic: true}),
    Bodies.rectangle(width/2, height, height, 10, {isStatic: true}),
    Bodies.rectangle(0, height/2, 10, height, {isStatic: true}),
    Bodies.rectangle(width, height/2, 10, height, {isStatic: true})
];

World.add(world, walls);

// Maze Generation Code

const shuffleAndMakeRandom = (arr) => {
    let counter = arr.length;
    while(counter > 0)
    {
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[index];
        arr[index] = arr[counter];
        arr[counter] = temp;
    }
    return arr;
};

const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal-1).fill(false));

const horizontals = Array(cellsVertical-1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startCol = Math.floor(Math.random() * cellsHorizontal);

const makeHorizontalSegments = () => {
    horizontals.forEach((row, rowIndex) => {
        row.forEach((open, colIndex) => {
            if(open)
                return;

            const wall = Bodies.rectangle(
                colIndex * unitLengthX + unitLengthX/2,
                rowIndex * unitLengthY + unitLengthY,
                unitLengthX,
                10,
                { 
                    isStatic: true,
                    label: 'wall',
                    render: { fillStyle: 'red' }
                }
            );            
            World.add(world, wall);
        });
    });
};

const makeVerticalSegments = () => {
    verticals.forEach((row, rowIndex) => {
        row.forEach((open, colIndex) => {
            if(open)
                return;

            const wall = Bodies.rectangle(
                colIndex * unitLengthX + unitLengthX,
                rowIndex * unitLengthY + unitLengthY/2,
                10,
                unitLengthY,
                { 
                    isStatic: true,
                    label: 'wall',
                    render: { fillStyle: 'red' }
                }
            );
            World.add(world, wall);
        });
    });
};

const mazeGenerator = (row, column) => {

    if(grid[row][column])
    {
        return;
    }
    grid[row][column] = true;
    const neighbors = shuffleAndMakeRandom([
        [row-1, column, 'up'],
        [row, column+1, 'right'],
        [row+1, column, 'down'],
        [row, column-1, 'left']
    ]);
    
    for(let neighbor of neighbors)
    {
        const [nextRow, nextCol, direction] = neighbor;
        if(nextRow < 0 || nextRow >= cellsVertical || nextCol < 0 || nextCol >= cellsHorizontal)
            continue;
        
        if(grid[nextRow][nextCol])
            continue;
        
        if(direction === 'right' || direction === 'left')
        {
            if(direction === 'right')
                verticals[row][column] = true;
            else
                verticals[row][column-1] = true;
        }
        else
        {
            if(direction === 'up')
                horizontals[row-1][column] = true;
            else
                horizontals[row][column] = true;
        }
        mazeGenerator(nextRow, nextCol);
    }
};

// Goal 
const goal = Bodies.rectangle(
    width - unitLengthX/2,
    height - unitLengthY/2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    { label: 'goal', isStatic: true, render: { fillStyle: 'green' } }
);

// Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    ballRadius,
    { label: 'ball', render: { fillStyle: 'blue' } }
);
World.add(world, goal);
World.add(world, ball);

mazeGenerator(startRow, startCol);
makeHorizontalSegments();
makeVerticalSegments();

document.addEventListener('keydown', (event) => {
    const {x, y} = ball.velocity;
    if(event.keyCode === 87)
    {
        Body.setVelocity(ball, { x, y: y - 5 });
    }
    else if(event.keyCode === 68)
    {
        Body.setVelocity(ball, { x: x + 5, y });
    }
    else if(event.keyCode === 83)
    {
        Body.setVelocity(ball, { x, y: y + 5 });
    }
    else if(event.keyCode === 65)
    {
        Body.setVelocity(ball, { x: x - 5, y });
    }

});

const userWonGame = () => {
    world.gravity.y = 1;
    world.bodies.forEach((body) => {
        if(body.label === 'wall')
            Body.setStatic(body, false);
    });
    document.querySelector('.winner').classList.remove('hidden');
};

// Win Condition
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];
        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label))
        {
            userWonGame();
        }
    });
});