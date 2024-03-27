const {Engine, Render, Runner, World, Bodies} = Matter;

const engine = Engine.create();
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
    Bodies.rectangle(width/2, 0, width, 40, {isStatic: true}),
    Bodies.rectangle(width/2, height, height, 40, {isStatic: true}),
    Bodies.rectangle(0, height/2, 40, height, {isStatic: true}),
    Bodies.rectangle(width, height/2, 40, height, {isStatic: true})
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

mazeGenerator(startRow, startCol);
makeHorizontalSegments();
makeVerticalSegments();