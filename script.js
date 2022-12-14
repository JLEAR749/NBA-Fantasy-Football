var playerInputEl = document.querySelector('#player')
var userFormEl = document.querySelector('#user-form');
var playerInfo = document.querySelector('.subtitle')
var playerStats = document.querySelector('#Playerstats')
var recentSearchesEl = document.querySelector('#recent-searches');
var history = document.querySelector('recentPlayer')

var teamOdds;
var oddsExplanation;


var formSubmitHandler = function (event) {
  event.preventDefault();

  var playerInput = playerInputEl.value.trim();



  if (playerInput) {

    playerStats.textContent = '';
    getPlayerId(playerInput);
    updateRecentSearches(playerInput);


  } else {
    $('.ui.modal')
      .modal('show')
      ;
  }
};




var updateRecentSearches = function (playerName) {
  var recentSearches = getRecentSearches();
  recentSearches.push(playerName);
  saveRecentSearched(recentSearches);
  addRecentSearchEl(playerName);
}

var setUpRecentSearchesEl = function () {
  var recentSearches = getRecentSearches();
  for (i = 0; i < recentSearches.length; i++) {
    var playerName = recentSearches[i];
    addRecentSearchEl(playerName);
  }
}

var addRecentSearchEl = function (recentPlayer) {
  var div = document.createElement('div');
  div.textContent = recentPlayer;
  recentSearchesEl.insertBefore(div, recentSearchesEl.children[0])
}

var getRecentSearches = function () {
  var recentSearches;
  var recentSearchesJSON = localStorage.getItem('playerInput');
  if (!recentSearchesJSON) {
    recentSearches = [];
  } else {
    recentSearches = JSON.parse(recentSearchesJSON);
  } 
  return recentSearches;
}
var saveRecentSearched = function (recentSearches) {
  localStorage.setItem('playerInput', JSON.stringify(recentSearches));
}




var getPlayerId = function (player) {
  const stats = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'ab81f85c68msh657a1c030dd42a6p1d14e5jsnad845cc2dca8',
      'X-RapidAPI-Host': 'free-nba.p.rapidapi.com'
    }
  };

  fetch('https://free-nba.p.rapidapi.com/players/?search=' + player, stats)
    .then(response => response.json())
    .then(function (data) {
      var playerId = data.data[0].id;
      getPlayerInfo(playerId);
    })
    .catch(err => console.error(err));

};

var getPlayerInfo = function (playerId) {
  const stats = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'ab81f85c68msh657a1c030dd42a6p1d14e5jsnad845cc2dca8',
      'X-RapidAPI-Host': 'free-nba.p.rapidapi.com'
    }
  };

  fetch('https://free-nba.p.rapidapi.com/stats?per_page=100&seasons[]=2022&player_ids[]=' + playerId, stats)
    .then(response => response.json())
    .then(function (data) {
      //appends the players name to the #PlayerStats <div>
      var playerName = document.createElement('div');
      playerName.textContent = 'Player stats for: ' + data.data[0].player.first_name + ' ' + data.data[0].player.last_name;
      playerStats.appendChild(playerName)
      //console.log(data)
      //loops through 5 games and appends the stats to #PlayerStats <div>
      for (i = 0; i < 5; i++) {
        var number = i + 1;
        var points = document.createElement('div');
        var assists = document.createElement('div');
        var fgpercentage = document.createElement('div');
        var gameNumber = document.createElement('div');

        gameNumber.setAttribute('style', 'margin-top: 20px;')
        points.setAttribute('style', 'margin-top: 10px;')
        assists.setAttribute('style', 'margin-top: 10px;')
        fgpercentage.setAttribute('style', 'margin-top: 10px;')

        points.textContent = 'points: ' + data.data[i].pts;
        assists.textContent = 'assists: ' + data.data[i].ast;
        fgpercentage.textContent = 'field goal percentage: ' + Math.floor(data.data[i].fg_pct * 100) + '%';
        gameNumber.textContent = 'game: ' + number;

        playerStats.appendChild(gameNumber);
        playerStats.appendChild(points);
        playerStats.appendChild(assists);
        playerStats.appendChild(fgpercentage);

      }
      //stores players name in a variabele
      var name = data.data[0].player.first_name + ' ' + data.data[0].player.last_name;
      //gets team name and stores it in a variable
      var playerTeam = data.data[0].team.name;
      //runs Api call with the team name and player name as parameters
      getGameOdds(playerTeam, name);
    })
    .catch(err => console.error(err));
}

var getGameOdds = function (playerTeam, name) {
  const gameOdds = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'ab81f85c68msh657a1c030dd42a6p1d14e5jsnad845cc2dca8',
      'X-RapidAPI-Host': 'odds.p.rapidapi.com'
    }
  };

  fetch('https://odds.p.rapidapi.com/v4/sports/basketball_nba/odds?regions=us&oddsFormat=decimal&markets=h2h%2Cspreads', gameOdds)
    .then(response => response.json())
    .then(function (data) {
      console.log(data);
      for (i = 0; i < data.length; i++) {
        if (data[i].away_team.includes(playerTeam) || data[i].home_team.includes(playerTeam)) {
          teamOdds = document.createElement('div');
          team2Odds = document.createElement('div');
          teamOdds.textContent = data[i].bookmakers[0].markets[0].outcomes[0].name + ': Odds price: ' + data[i].bookmakers[0].markets[0].outcomes[0].price;
          team2Odds.textContent = data[i].bookmakers[0].markets[0].outcomes[1].name + ': Odds price: ' + data[i].bookmakers[0].markets[0].outcomes[1].price;
          playerStats.appendChild(teamOdds);
          playerStats.appendChild(team2Odds);
          teamOdds.setAttribute('style', 'margin-top: 20px;')   
          team2Odds.setAttribute('style', 'margin-top: 10px;')                                                              
        }
      }
      if (!teamOdds || !teamOdds ===  null) {
        noGames(name);
      }
    })
    .catch(err => console.error(err));
}

var noGames = function (name) {
  teamOdds = document.createElement('div');
  teamOdds.textContent = name + ' Does not have any games today';
  playerStats.appendChild(teamOdds);
  teamOdds.setAttribute('style', 'margin-top: 10px;') 
}

setUpRecentSearchesEl();
userFormEl.addEventListener('submit', formSubmitHandler);


