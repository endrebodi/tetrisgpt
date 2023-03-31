const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = 20;

ctx.scale(scale, scale);

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = "white";
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

const arena = createMatrix(canvas.width / scale, canvas.height / scale);

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        player.pos.y = 0;
    }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
        dropCounter = 0;
    }

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);

    requestAnimationFrame(update);
}

const player = {
    pos: { x: 5, y: 0 },
    matrix: createPiece('T')
};

function createPiece(type) {
    if (type === 'T') {
        return [
            [1, 1, 1],
            [0, 1, 0]
        ];
    }
    // Add other Tetris pieces here
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }

}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);

    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));

        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }


}

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        player.pos.x--;
        if (collide(arena, player)) {
            player.pos.x++;
        }
    } else if (event.key === 'ArrowRight') {
        player.pos.x++;
        if (collide(arena, player)) {
            player.pos.x--;
        }
    } else if (event.key === 'ArrowDown') {
        playerDrop();
    } else if (event.key === 'ArrowUp') {
        playerRotate(1);
    }
});

update();