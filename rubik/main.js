document.addEventListener('DOMContentLoaded', () => {
    const cube = document.getElementById('cube');
    const pieceSize = 70; // Debe coincidir con --piece-size en CSS, pero en JS
    let isAnimating = false;

    // Crear y posicionar los 26 cubies
    function createCubies() {
        cube.innerHTML = ''; // Limpiar cubo
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    if (x === 0 && y === 0 && z === 0) continue; // No hay cubie central

                    const cubie = document.createElement('div');
                    cubie.classList.add('cubie');
                    
                    // Guardar la posición inicial en el propio elemento
                    cubie.dataset.x = x;
                    cubie.dataset.y = y;
                    cubie.dataset.z = z;
                    
                    cubie.style.transform = `translate3D(${x * pieceSize}px, ${y * pieceSize}px, ${z * piece-Size}px)`;

                    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
                    faces.forEach(face => {
                        const faceDiv = document.createElement('div');
                        faceDiv.classList.add(face);
                        cubie.appendChild(faceDiv);
                    });
                    cube.appendChild(cubie);
                }
            }
        }
    }

    // Seleccionar los cubies que pertenecen a una cara
    function getCubies(axis, slice) {
        return Array.from(cube.children).filter(cubie => {
            const pos = { x: cubie.dataset.x, y: cubie.dataset.y, z: cubie.dataset.z };
            return pos[axis] == slice;
        });
    }
    
    // Función principal para mover una cara
    window.move = async function(notation) {
        if (isAnimating) return;
        isAnimating = true;

        const prime = notation.includes("'");
        const move = notation.charAt(0);
        const angle = prime ? -90 : 90;

        let axis = 'x';
        let slice = 0;

        switch (move) {
            case 'R': axis = 'x'; slice = 1; break;
            case 'L': axis = 'x'; slice = -1; break;
            case 'U': axis = 'y'; slice = -1; break;
            case 'D': axis = 'y'; slice = 1; break;
            case 'F': axis = 'z'; slice = 1; break;
            case 'B': axis = 'z'; slice = -1; break;
        }
        
        const cubiesToMove = getCubies(axis, slice);

        await new Promise(resolve => {
            gsap.to(cubiesToMove, {
                duration: 0.4,
                rotationX: axis === 'x' ? `+=${angle}` : '+=0',
                rotationY: axis === 'y' ? `+=${angle}` : '+=0',
                rotationZ: axis === 'z' ? `+=${angle}` : '+=0',
                ease: 'power2.inOut',
                onComplete: () => {
                    // Actualizar la posición lógica de los cubies después de la animación
                    updateCubiePositions(cubiesToMove, axis, angle);
                    resolve();
                }
            });
        });
        
        isAnimating = false;
    }
    
    // Actualiza los data-attributes de los cubies después de un movimiento
    function updateCubiePositions(cubies, axis, angle) {
        const rad = gsap.utils.wrap(0, 360)(angle) * (Math.PI / 180);
        const cos = Math.round(Math.cos(rad));
        const sin = Math.round(Math.sin(rad));

        for (const cubie of cubies) {
            let { x, y, z } = cubie.dataset;
            x = parseInt(x);
            y = parseInt(y);
            z = parseInt(z);

            let newX, newY, newZ;

            if (axis === 'x') {
                newX = x;
                newY = y * cos - z * sin;
                newZ = y * sin + z * cos;
            } else if (axis === 'y') {
                newX = x * cos + z * sin;
                newY = y;
                newZ = -x * sin + z * cos;
            } else { // axis === 'z'
                newX = x * cos - y * sin;
                newY = x * sin + y * cos;
                newZ = z;
            }
            
            cubie.dataset.x = newX;
            cubie.dataset.y = newY;
            cubie.dataset.z = newZ;
        }
    }

    // Función para desarmar el cubo
    window.scramble = async function() {
        if (isAnimating) return;
        const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
        const modifiers = ['', "'"];
        
        for (let i = 0; i < 25; i++) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            const randomModifier = modifiers[Math.floor(Math.random() * modifiers.length)];
            await move(randomMove + randomModifier);
        }
    }

    // Función para armar/resetear el cubo
    window.resetCube = function() {
        if (isAnimating) return;
        gsap.to(cube.children, {
            duration: 0.5,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            ease: 'power2.inOut',
            onComplete: createCubies // Recrea los cubies para asegurar un estado limpio
        });
    }

    // Creación inicial del cubo
    createCubies();
});