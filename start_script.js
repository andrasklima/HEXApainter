const topScorers = 10;
let topScorersPage = 1;

function highscoreHighlight() {
  let top_names = document.querySelectorAll("#inner_records .score_text");

  let colors_of_tops = [
    "red",
    "green",
    "deeppink",
    "orange",
    "yellow",
    "purple",
    "lightgreen",
    "fuchsia",
    "blue",
    "lime",
    "dodgerblue",
  ];

  colors_of_tops.sort(() => Math.random() - 0.5);

  // let timer_over = 0;

  for (let color_index = 0; color_index < colors_of_tops.length; color_index++) {
    setTimeout(function () {
      for (let index = 0; index < top_names.length; index++) {
        let colorChange = color_index + index;
        if (colorChange > 10) {
          colorChange = colorChange - 10;
        }

        /* let red_number = Math.floor(Math.random() * 255);
				let green_number = Math.floor(Math.random() * 255);
				let blue_number = Math.floor(Math.random() * 255);
				*/
        if (top_names[index] !== null) {
          top_names[index].style.color = colors_of_tops[colorChange];
        }
      }
    }, 150 * color_index);
  }
}

function loadHighScores() {
  const bucket = KVdb.bucket("WaEBipgTvS1Hyv4ecnYRrK");

  const run = async () => {
    let topScoreRank = 1;
    let topscore = document.querySelector("#inner_records");

    // list key-values by prefix (returns an array of [key, value] tuples)
    res = await bucket.list({ prefix: "username", values: true });
      
    res.sort(function (a, b) {
      return b[1] - a[1];
    });

    scoreTexts = document.querySelectorAll("#inner_records .score_text");
    for (let index = 0; index < scoreTexts.length; index++) {
      scoreTexts[index].outerHTML = "";
    }

    for (const [key, value] of res) {
      let name = key.replace("username:", "");

      nameHTML = `
        <div class="score_text">
       	  <span class="topscore_name">${name}</span> <span class="topscore_score"> ${value}</span>
        </div>`;

      if (
        topScoreRank > topScorers * (topScorersPage - 1) &&
        topScoreRank <= topScorers * topScorersPage
      ) {
        topscore.insertAdjacentHTML("beforeend", nameHTML);
      }

      topScoreRank++;
      
      if (topScoreRank > topScorers * topScorersPage) {
        if (topScoreRank > res.length) {
          topScorersPage = 1;
        } else {
          topScorersPage++;
        }
        break;
      }
    }

    highscoreHighlight();
  };

  run();
}

function load_starter() {
  const enter = document.getElementById("enter");
  //console.log(enter)

  function open_game() {
    console.log("click");
    window.open("./game.html", "_self");
  }
  enter.style.cursor = "pointer";
  enter.addEventListener("click", open_game);

  //enter.onclick = function () {
  //console.log("click");

  //}

  //enter.addEventListener("click",  open_game );

  loadHighScores();

  setInterval(function () {
    loadHighScores();
  }, 6000);
} // end

window.addEventListener("load", load_starter);
