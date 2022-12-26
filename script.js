/* globals Chart */

(function () {
    const COLORS = {
        red: '#df4933',
        orange: '#ff8c00',
        yellow: '#fdd949',
        green: '#008000',
        blue: '#4169e1',
        purple: '#800080',
        brown: '#8b4513',
        pink: '#ff1493',
        white: '#ffffff'
    };

    const config = {
        type: 'line',
        data: {
            labels: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
            datasets: []
        },
        options: {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: false,
                itemSort: (a, b) => a.yLabel < b.yLabel ? -1 : 1
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: 'Month'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: 'Value'
                    }
                }]
            }
        }
    };

    window.onload = function () {
        const ctx = document.getElementById('canvas').getContext('2d');
        console.log('ctx', ctx);
        console.log('config', config);
        window.myLine = new Chart(ctx, config);

        restoreInputs();
    };

    function restoreInputs() {
        const game = getGame();

        if (game) {
            const inputStartingTiles = getStartingTilesInput();
            inputStartingTiles.value = game.startingTiles;
        }

        const scores = getScores();

        if (Object.keys(scores).length === 0) {
            return;
        }

        Object.entries(scores).forEach(([name, score]) => {
            console.log('name, score', name, score);

            addPlayer(name, score.color);

            const inputs = getScoreInputs();
            const nameInputs = inputs.filter(input => input.name.split('-')[0] === name);

            Object.entries(score.rounds).forEach(([round, score]) => {
                const roundInput = nameInputs.filter(input => input.name.split('-')[1] === round)[0];

                roundInput.value = score;
            });
        });

        Object.entries(scores).forEach(([name, score]) => {
            config.data.datasets.forEach(dataset => {
                if (dataset.label === name) {
                    const orderedRoundScores = Object.entries(score.rounds).sort((a, b) => parseInt(b[0]) - parseInt(a[0])).map(a => a[1]);
                    const roundSums = cumSums(orderedRoundScores);

                    dataset.data = roundSums;
                }
            });
        });

        setTabIndexes();

        window.myLine.update();
    }

    function getStartingTilesInput() {
        return document.getElementById('input-starting-tiles');
    }

    function getScoreInputs() {
        return [...document.querySelectorAll('input.score-input')];
    }

    function addPlayerDataset(name, colorName) {
        let color;
        if (colorName) {
            color = COLORS[colorName];
        }
        else {
            color = `
                rgb(
                    ${Math.floor(Math.random() * 256)},
                    ${Math.floor(Math.random() * 256)},
                    ${Math.floor(Math.random() * 256)}
                )
            `;
        }

        config.data.datasets.push({
            backgroundColor: color,
            borderColor: color,
            data: [],
            fill: false,
            label: name,
            lineTension: 0
        });
    }

    function createPlayerRowHtml(name, color) {
        return `
                <td><span>${name}</span><img src="assets/${color}-train.jpg" height="32px"></td>
                <td><input class="score-input" type="number" name="${name}-12"></td>
                <td><input class="score-input" type="number" name="${name}-11"></td>
                <td><input class="score-input" type="number" name="${name}-10"></td>
                <td><input class="score-input" type="number" name="${name}-9"></td>
                <td><input class="score-input" type="number" name="${name}-8"></td>
                <td><input class="score-input" type="number" name="${name}-7"></td>
                <td><input class="score-input" type="number" name="${name}-6"></td>
                <td><input class="score-input" type="number" name="${name}-5"></td>
                <td><input class="score-input" type="number" name="${name}-4"></td>
                <td><input class="score-input" type="number" name="${name}-3"></td>
                <td><input class="score-input" type="number" name="${name}-2"></td>
                <td><input class="score-input" type="number" name="${name}-1"></td>
                <td><input class="score-input" type="number" name="${name}-0"></td>
                <td><button id="btn-remove-player-${name}" class="btn-remove-player">Remove Player</button></td>
            `;
    }

    function setTabIndexes() {
        const numPlayers = Object.keys(getScores()).length;

        getScoreInputs().forEach((input, index) => {
            input.tabIndex = (index % 13) * numPlayers + Math.floor(index / 13) + 10;
        });
    }

    function getScores() {
        return JSON.parse(sessionStorage.getItem('scores')) || {};
    }

    function saveScores(scores) {
        sessionStorage.setItem('scores', JSON.stringify(scores));
    }

    function getGame() {
        return JSON.parse(sessionStorage.getItem('game')) || {};
    }

    function saveGame(game) {
        sessionStorage.setItem('game', JSON.stringify(game));
    }

    function cumSums(scores) {
        let sum;
        return scores.map(elem => sum = (sum || 0) + elem);
    }

    // Events

    document.getElementById('input-starting-tiles').addEventListener('change', (e) => {
        console.log('input-starting-tiles change');

        let game = getGame();
        game.startingTiles = e.target.value;

        saveGame(game);
    });

    document.getElementById('btn-new-game').addEventListener('click', () => {
        console.log('btn-new-game click');

        let scores = getScores();

        Object.keys(scores).forEach(name => {
            scores[name].rounds = {};
        });

        saveScores(scores);

        const inputs = getScoreInputs();

        inputs.forEach(input => {
            input.value = undefined;
        });

        config.data.datasets.forEach(dataset => {
            dataset.data = [];
        });

        window.myLine.update();
    });

    document.getElementById('btn-add-player').addEventListener('click', () => {
        console.log('btn-add-player click');

        const inputAddPlayer = document.getElementById('input-add-player');
        const newPlayer = inputAddPlayer.value;
        inputAddPlayer.value = '';

        const selectPlayerColor = document.getElementById('select-player-color');
        const newPlayerColor = selectPlayerColor.value;
        selectPlayerColor.value = '';

        addPlayer(newPlayer, newPlayerColor);
    });

    document.getElementById('btn-download-results').addEventListener('click', () => {
        console.log('btn-download-results click');

        downloadResults();
    });

    function addRemovePlayerButtonEventListener(button) {
        button.addEventListener('click', () => {
            console.log('btn-remove-player click');

            const name = button.id.split('-')[3];
            console.log('name', name);

            removePlayer(name);
        });
    }

    function addPlayer(name, color) {
        console.log('addPlayer', name, color);

        const tbody = document.getElementsByTagName('tbody')[0];
        const newRow = tbody.insertRow(tbody.rows.length);

        newRow.innerHTML = createPlayerRowHtml(name, color);

        addScoreInputEventListeners([...document.querySelectorAll(`input[name*=${name}]`)]);
        addRemovePlayerButtonEventListener(document.querySelector(`button#btn-remove-player-${name}`));

        addPlayerDataset(name, color);

        let scores = getScores();

        if (!scores[name]) {
            scores[name] = {
                color: color,
                rounds: {}
            };
        }

        saveScores(scores);

        setTabIndexes();

        window.myLine.update();
    }

    function removePlayer(name) {
        const tbody = document.getElementsByTagName('tbody')[0];

        const rowIndex = [...tbody.rows].findIndex(row => row.children[0].children[0].innerHTML === name);
        tbody.deleteRow(rowIndex);

        const dataSetIndex = config.data.datasets.findIndex(dataset => dataset.label === name);
        config.data.datasets.splice(dataSetIndex, 1);

        let scores = getScores();

        if (scores[name]) {
            delete scores[name];
        }

        saveScores(scores);

        setTabIndexes();

        window.myLine.update();
    }

    function addScoreInputEventListeners(inputs) {
        inputs.forEach(element => {
            element.addEventListener('change', function (e) {
                console.log('e', e);
                const [name, round] = e.target.name.split('-');
                const score = parseInt(e.target.value);

                let scores = getScores();
                console.log('scores', scores);

                let nameObj = scores[name];
                nameObj = nameObj || {};
                const nameScore = nameObj.rounds || {};
                console.log('nameScore', nameScore);

                nameScore[round] = score;
                nameObj.rounds = nameScore;
                scores[name] = nameObj;

                saveScores(scores);

                config.data.datasets.forEach(dataset => {
                    console.log('dataset', dataset);
                    if (dataset.label === name) {
                        const orderedRoundScores = Object.entries(nameScore).sort((a, b) => parseInt(b[0]) - parseInt(a[0])).map(a => a[1]);
                        const roundSums = cumSums(orderedRoundScores);

                        dataset.data = roundSums;
                    }
                });

                window.myLine.update();
            });
        });
    }

    addScoreInputEventListeners(getScoreInputs());

    // Download Results

    function downloadResults() {
        // {
        //   game: {
        //      downloaded_at: timestamp,
        //      starting_tiles: number
        //   },
        //   scores: [
        //      {
        //          player: string,
        //          rounds: {
        //              12: number
        //          },
        //          total: number
        //      },
        //      ...
        //   ]
        // }

        const game = getGame();
        const scores = getScores();

        const results = {
            game: {
                downloaded_at: Date.now(),
                starting_tiles: parseInt(game.startingTiles)
            },
            scores: Object.entries(scores).map(([player, scores]) => ({
                player,
                color: scores.color,
                rounds: scores.rounds,
                total: Object.values(scores.rounds).reduce((acc, val) => acc + val, 0)
            }))
        };

        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(results));

        const dlAnchorElem = document.getElementById('anchor-download');

        dlAnchorElem.setAttribute('href', dataStr);
        dlAnchorElem.setAttribute('download', 'trains-results.json');
        dlAnchorElem.click();
    }
})();
