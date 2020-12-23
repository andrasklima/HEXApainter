const hexagonMaxCount = -1; // -1 no limit

var level = 1; // mennyi hexagon jelenjen meg egyszerre

const debug = false;

var hexagonCount = -1; // itt tárolja a program, mennyi hexagon van összesen a képernyőn

let zIndex = 0;

// itt tárolja, hogy melyik hexagon mikor tűnik el, kattintásra "pontszámmmá" válik (negatív érték)
let hexagonRemainingTimes = {}; // tömbelem = szint száma * 1000 + hexagon_id

var hexagonTimer;

var countdownTimer;

// véletlenszám generátor, adott tartományon belül, a megadott tizedesig kerekítve (0 = egész szám)
function getRandomInRange(min, max, fractionDigits) {
  let number = Math.random() * (max - min) + min;

  return parseFloat(number.toFixed(fractionDigits));
}

// na ki a király?
function isKingOfHexagons() {
  let isKing = true;

  for (hexaId in hexagonRemainingTimes) {
    if (hexagonRemainingTimes[hexaId] <= 0) {
      isKing = false;
    }
  }

  return isKing;
}

// összpontszám
function overallScore() {
  let score = 0;

  for (hexaId in hexagonRemainingTimes) {
    let hexagonScore = hexagonRemainingTimes[hexaId];

    // kattintva volt
    if (hexagonScore < 0) {
      hexagonScore = hexagonScore * Math.floor(hexaId / 1000); // szint számával korrigálunk, minél magasabb a szint, annál többet ér 

      score += hexagonScore;
    }
  }

  return Math.abs(score);
}

// szint pontszám
function levelScore() {
  let score = 0;

  for (let index = 1; index <= hexagonCount; index++) {
    let hexagonScore = hexagonRemainingTimes[level * 1000 + index];

    if (hexagonScore !== undefined) {
      // ha már van pontszáma...
      if (hexagonScore < 0) {
        // kattintva volt
        score += hexagonScore;
      }
    }
  }

  return Math.abs(score);
}

// mennyi kitöltetlen hexagon van még a szinten
function unfilledHexagonCount(visibleOnly) { 
  let count = 0;

  for (let index = 1; index <= hexagonCount; index++) {
    let polygon = document.querySelector(`#gameboard #hexagon-${index}`);

    if (polygon.style.fill === "") {
      let svgClassList = polygon.parentElement.classList;

      if (visibleOnly) { // a képernyőn még látható kitöltetlen hexagonok száma
        if (svgClassList.contains("show")) {
          count++;
        }
      } else {
        if (!svgClassList.contains("hide")) {
          count++;
        }
      }
    }
  }

  return count;
}

// a szinten még meg nem jelent (láthatatlan) hexagonok száma (maradék hexagonok száma)
function invisibleHexagonCount() {
  let count = 0;

  for (let index = 1; index <= hexagonCount; index++) {
    let polygon = document.querySelector(`#gameboard #hexagon-${index}`);

    let svgClassList = polygon.parentElement.classList;

    if (!svgClassList.contains("show") && !svgClassList.contains("hide")) {
      count++;
    }
  }

  return count;
}

// hexagonok megjelenítése, a szintnek megfelelő számossággal (annyi jelenik meg egyszerre, ahányadik szinten járunk)
function showHexagon(number) {
  if (debug) {
    console.log(`
      showHexagon(${number})`);
  }

  while (number > 0) {
    let randomHexagon = getRandomInRange(1, hexagonCount, 0);
    if (debug) {
      console.log(`
        randomHexagon = ${randomHexagon}`);
    }

    let polygon = document.querySelector(`#gameboard #hexagon-${randomHexagon}`);

    let svgClassList = polygon.parentElement.classList;
    if (!svgClassList.contains("show") && !svgClassList.contains("hide")) {
      polygon.parentElement.style.zIndex = ++zIndex;

      svgClassList.add("show");
      number--;

      hexagonRemainingTimes[level * 1000 + randomHexagon] = getRandomInRange(
        5,
        20 + getRandomInRange(1, level, 0), //szintenként 0.1 másodperccel nőhet az idő
        0
      );

      if (debug) {
        console.log(`
          hexagonRemainingTime = ${
            hexagonRemainingTimes[level * 1000 + randomHexagon]
          }`);
      }
    } else if (invisibleHexagonCount() === 0) {
      // nincs több megjeleníthető
      number = -1;
    }
  }

  return number;
}

// játék vége, nincs több szint
function gameCompleted() {
  /* 
    let svgs = document.querySelectorAll("#wrapper svg");
    svgs.forEach((svg) => {
      let randomScale = getRandomInRange(1, 3, 2);
      svg.style.transform += ` scale(${randomScale})`;
    });
 */
  let red_number = getRandomInRange(0, 255, 0);
  let green_number = getRandomInRange(0, 255, 0);
  let blue_number = getRandomInRange(0, 255, 0);
  let transparency = getRandomInRange(0, 1, 2);
  document.querySelector(
    "#wrapper"
  ).style.backgroundColor = `rgba(${red_number}, ${blue_number},${green_number},${transparency})`;

  let boards = document.querySelectorAll(".gameboard");
  boards.forEach((board) => {
    board.style.backgroundColor = "initial";
    board.style.opacity = 1;
  });

  let wrapperDiv = document.querySelector("#wrapper");
  wrapperDiv.classList.add("game-completed");

  if (isKingOfHexagons()) {
    hexagonRemainingTimes[9999] = overallScore() * -1; // Double the points, bonus added
    refreshScoreboard();
    /* 
    alert(
      `PERFECT GAME!\n\nYOU ARE THE KING OF THE HEXAGONS!\n\nYour overall score is ${overallScore()}.`
    );
 */
    click_king(null, level, overallScore());
  } else {
    /* 
    alert(
      `GAME COMPLETED!\n\nCongratulations, you have reached the last level.\nYour overall score is ${overallScore()}.`
    );

 */
    click_win(null, level, overallScore(), true);
  }
  // hideScoreboard();
}

// szintnek vége
function levelFinished() {
  if (debug) {
    console.log(`
      levelFinished`);
  }

  if (hexagonTimer) {
    clearInterval(hexagonTimer);
  }

  if (debug) {
    console.log(`hexagonRemainingTimes = ${hexagonRemainingTimes}`);
  }

  let score = levelScore();
  if (score > 0) {
    /* 
    alert(
      `LEVEL COMPLETED!\n\nYou have completed level ${level}.\nYour level score is ${score}`
    );
*/
    click_done(null, level, score);
  } else {
    level--; // utolsó szint nincs teljesítve
    refreshScoreboard();
    /* 
    alert(
      `GAME COMPLETED!\n\nYou have completed ${level} levels.\nYour overall score is ${overallScore()}.`
    );
 */
    click_win(null, level, overallScore(), false);
  }

  hideScoreboard();
}

// véletlen szín generátor (inspired by Ower)
function randomColor() {
  let red_number = getRandomInRange(0, 255, 0);
  let green_number = getRandomInRange(0, 255, 0);
  let blue_number = getRandomInRange(0, 255, 0);
  let transparency = getRandomInRange(0.5, 1, 2);

  return `rgba(${red_number}, ${blue_number},${green_number},${transparency})`;
}

// hexagon kattintás eseményfigyelő ide fut be
function hexagonClick(evt) {
  if (debug) {
    console.log(`
      hexagonClick`);
  }

  fillColor = randomColor();

  let polygon = document.querySelector("#gameboard #" + evt.target.id);
  polygon.style.fill = fillColor;

  polygon.removeEventListener("click", hexagonClick); // ha ezt a sort töröljük, akkor változtatható marad a már megjelentek színe

  if (polygon.parentElement.style.zIndex > 0) {
    // ha változtatható színű lenne, akkor csak első kattintást kell figyelni

    let hexaIdString = evt.target.id;
    let hexaId = level * 1000 + parseInt(hexaIdString.replace("hexagon-", ""));

    let score = hexagonRemainingTimes[hexaId];

    let actualSize =
      polygon.parentElement.clientWidth * polygon.parentElement.style.scale;
    let scoreCorrection = (1 / actualSize) * 100;

    score = Math.round(score * scoreCorrection); // mérettel korrigáljuk a pontokat

    score = Math.max(score, 1); // mindenképp kapjon legalább 1 pontot, ha például utolsó pillanatban nyomott nagy elemre

    if (debug) {
      console.log(`
        ${hexaIdString}: score = ${score}; scoreCorrection = ${scoreCorrection}`);
    }

    hexagonRemainingTimes[hexaId] = score * -1; // negatív számmal jelöljük, hogy kattintva volt!!!

    polygon.parentElement.style.zIndex = 0;

    refreshScoreboard();

    if (unfilledHexagonCount() === 0) {
      levelFinished();
    } else {
      if (unfilledHexagonCount(true) === 0) {
        showHexagon(level);
      }
    }
  }
}

// hexagonok gyártósora
function createHexagons(divId, colorize) { // paraméterzés a háttér automatikus létrehozása miatt került bele, de elvetélt próbálkozás
  if (debug) {
    console.log(`
      createHexagons()`);
  }

  if (divId === undefined) {
    divId = "#gameboard";
  }

  let fillColor = debug ? "black" : "gray";
  if (colorize === undefined) {
    colorize = fillColor;
  }

  let gameBoard = document.querySelector(divId);

  let hexagonCount = -1;
  let hexagonId = 0;

  while (hexagonCount !== hexagonId) {
    hexagonId++;

    if (colorize === "random") {
      fillColor = randomColor();
    }

    let boxSize = getRandomInRange(30, 200, 0); // felbontástól függően kell változtatni a méreteit

    gameBoard.insertAdjacentHTML(
      "beforeEnd", //  show class kell svg-nek, hogy látni lehessen elején mi csúszik ki képernyőről
      `
      <svg class="hexagon" height="${boxSize}" width="${boxSize}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <polygon id="hexagon-${hexagonId}" points="26.1 91.9 2.3 50 26.1 8.1 73.9 8.1 97.7 50 73.9 91.9 26.1 91.9" fill="${fillColor}" />
        <path d="M73.6,8.6,97.1,50,73.6,91.4H26.4L2.9,50,26.4,8.6H73.6m.5-1H25.9L1.7,50,25.9,92.4H74.1L98.3,50,74.1,7.6Z" />
      </svg>
    `
    );

    let polygon = document.querySelector(`${divId} #hexagon-${hexagonId}`);
    polygon.addEventListener("click", hexagonClick);

    let svg = polygon.parentElement;

    // ITT KELL LEVIZSGÁLNI, HOGY KIFÉR-E A KÉPERNYŐRE, HA NEM, AKKOR TÖRÖLNI KELL ÉS NEM KELL TÖBBET CSINÁLNI
    let boardRect = gameBoard.getBoundingClientRect();
    let svgRect = svg.getBoundingClientRect();
    let offset = svgRect.top - boardRect.top;

    if (debug) {
      console.log(`
        ${hexagonId} element y position is ${svgRect.top} and ${offset} vertical pixels from top`);
    }

    if (offset + svgRect.height > boardRect.height) {
      svg.outerHTML = "";
      hexagonId--;

      hexagonCount = hexagonId; // ha nem fér ki, nem rajzolunk többet!!!
    }

    if (hexagonId === hexagonMaxCount) {
      //elértük a beállított maximális számot
      hexagonCount = hexagonId;
    }
  }

  if (debug) {
    console.log(`
        hexagonCount = ${hexagonCount}`);
  }

  //nodeList
  let svgs = document.querySelectorAll(`${divId} svg`);
  svgs.forEach((svg) => {
    let turnDegree = getRandomInRange(0, 360, 0);
    let randomScale = getRandomInRange(0.5, 2, 2);

    svg.style.rotate = `${turnDegree}deg`;   // véletlen elforgatás chrome-on nem megy
    svg.style.scale = `${randomScale}`;   // véletlen méret
    svg.style.transform = `${randomScale} ${turnDegree}deg`;

    switch (getRandomInRange(1, 3, 0)) {
      case 1:
        svg.style.alignSelf = "start";
        break;
      case 2:
        svg.style.alignSelf = "center";
        break;
      case 3:
        svg.style.alignSelf = "end";
        break;
      default:
        console.log("ERROR");
        break;
    }
  });

  return hexagonCount;
}

// ez vizsgálja mennyi van még hátra a hexagon "életéből"
// 0-nál a hexagon eltűnik
function visibilityTimer() {
  for (hexaId in hexagonRemainingTimes) {
    if (hexaId > level * 1000) {
      // aktuális szinthez tartozik

      let polygonId = hexaId - level * 1000; // a szintet levesszük az értékből
      let polygon = document.querySelector(`#gameboard #hexagon-${polygonId}`);

      if (polygon !== null) {
        //timer leállítás után még egyszer idekavarodik...

        if (polygon.style.fill === "") {
          if (hexagonRemainingTimes[hexaId] <= 0) {
            let svgClassList = polygon.parentElement.classList;

            if (svgClassList.contains("show")) {
              svgClassList.add("hide");
              svgClassList.remove("show");

              refreshScoreboard();

              if (unfilledHexagonCount(true) === 0) {
                // ha nincs a képernyőn több kattintható (töltetlen)
                showHexagon(level);
              }

              if (unfilledHexagonCount() === 0) {
                // ha egyáltalán nincs több töltetlen
                levelFinished();
              }
            }
          } else {
            hexagonRemainingTimes[hexaId] -= 1;
          }
        }
      }
    }
  }
  // randomBackground(); // kimondottan ronda ezzel
}

// szint beállítása
function startLevel() {
  if (debug) {
    console.log(`
      startLevel()`);
  }

  level++;

  let board = document.querySelector("#gameboard");

  // előző szint képének elmentése
  if (level > 1) {
    let newBoard = board.cloneNode(true);
    newBoard.id = `gameboard-${level - 1}`;
    document.querySelector("#wrapper").insertAdjacentElement("afterbegin", newBoard);
  }

  board.innerHTML = "";

  hexagonCount = createHexagons();

  if (debug) {
    console.log(`
        level = ${level}
        hexagonCount = ${hexagonCount}`);
  }

  showScoreboard();

  refreshScoreboard();

  if (level > hexagonCount) {
    gameCompleted();
  } else {
    showHexagon(level);

    if (hexagonTimer) {
      clearInterval(hexagonTimer);
    }
    hexagonTimer = setInterval(visibilityTimer, 100);
  }
}

// induláskor a másodpercenként hívódik meg a visszaszámlás kiiratásáért felelős
function countdownInterval() {
  let countdownDivs = document.querySelectorAll("#countdown div");
  let index = 0;
  while (index < countdownDivs.length) {
    const element = countdownDivs[index];

    if (!element.parentNode.classList.contains("show")) {
      element.parentNode.classList.add("show");
    }

    if (element.classList.contains("show")) {
      element.classList.remove("show");
      element.classList.add("hide");

      break;
    } else if (!element.classList.contains("hide")) {
      let finish_hexagons = element.querySelectorAll(".hexa_digit g polygon");
      if (finish_hexagons !== undefined) {
        draw_hexagons(finish_hexagons);
      }
      
      element.classList.add("show");      

      break;
    } else if (index === countdownDivs.length - 1) {
      element.parentNode.classList.remove("show");

      clearInterval(countdownTimer);

      startLevel();

      break;
    }

    index++;
  }
}

// játl indul
function startGame() {
  initGame();

  countdownTimer = setInterval(countdownInterval, 1000);
}

// eredményjelző frissítése
function refreshScoreboard() {
  document.querySelector("#level").innerHTML = level;
  document.querySelector("#overallScore").innerHTML = overallScore();
  document.querySelector("#levelScore").innerHTML = levelScore();
  document.querySelector("#remainingHexagons").innerHTML = invisibleHexagonCount();
}

// eredményjelző megjelenítése
function showScoreboard() {
  let scoreboardDiv = document.querySelector("#scoreboard");
  scoreboardDiv.classList.remove("hide");
}

// eredményjelző eltűntetése
function hideScoreboard() {
  let scoreboardDiv = document.querySelector("#scoreboard");
  scoreboardDiv.classList.add("hide");
}

// Your game can start here, but define separate functions, don't write everything in here :)
function initGame() {
  hideScoreboard();

  level = 0;
  hexagonRemainingTimes = {};
  hexagonCount = -1;
  zIndex = 0;

  let wrapperDiv = document.querySelector("#wrapper");
  wrapperDiv.innerHTML = "";
  wrapperDiv.classList.remove("game-completed");

  wrapperDiv.insertAdjacentHTML(
    "afterbegin",
    `<div id="gameboard" class="gameboard"></div>`
  );
}

// véltetlen háttér generálás (elvetélt kísérlet)
function randomBackground() {
  let pageDiv = document.querySelector("#page");
  pageDiv.innerHTML = "";

  createHexagons("#page", "random");

  let svgs = document.querySelectorAll(`#page svg`);
  svgs.forEach((svg) => {
    svg.classList.add("show");
  });
}

function hideDevButtons() {
  let div = document.querySelector("#devButtons");
  div.classList.add("hide");
}

// oldal betöltődése után (egyszer) hívódik meg
function page_loaded() {
  randomBackground();

  initGame();

  startGame();
}

window.addEventListener("load", page_loaded);
