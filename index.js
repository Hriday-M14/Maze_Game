const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;

const width = 600, height = 600;
const cells = 3;
const unitLength = width / cells;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: width,
        height: height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);


// Walls or Borders of Canvas
const walls = [
    Bodies.rectangle(width/2, 0, width, 3, {isStatic: true}),
    Bodies.rectangle(width/2, height, height, 3, {isStatic: true}),
    Bodies.rectangle(0, height/2, 3, height, {isStatic: true}),
    Bodies.rectangle(width, height/2, 3, height, {isStatic: true})
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

const grid = Array(cells)
    .fill(null)
    .map(() => Array(cells).fill(false));

const verticals = Array(cells)
    .fill(null)
    .map(() => Array(cells-1).fill(false));

const horizontals = Array(cells-1)
    .fill(null)
    .map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startCol = Math.floor(Math.random() * cells);

const makeHorizontalSegments = () => {
    horizontals.forEach((row, rowIndex) => {
        row.forEach((open, colIndex) => {
            if(open)
                return;

            const wall = Bodies.rectangle(
                colIndex * unitLength + unitLength/2,
                rowIndex * unitLength + unitLength,
                unitLength,
                10,
                { isStatic: true }
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
                colIndex * unitLength + unitLength,
                rowIndex * unitLength + unitLength/2,
                10,
                unitLength,
                { isStatic: true }
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
        if(nextRow < 0 || nextRow >= cells || nextCol < 0 || nextCol >= cells)
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
    width - unitLength/2,
    height - unitLength/2,
    unitLength * 0.7,
    unitLength * 0.7,
    { label: 'goal', isStatic: true }
);

// Ball
const ball = Bodies.circle(
    unitLength/2,
    unitLength/2,
    unitLength/4,
    { label: 'ball' }
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

// Win Condition
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];
        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label))
        {
            console.log("User Won");
        }
    });
});