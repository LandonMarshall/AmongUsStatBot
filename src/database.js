const Sequelize = require('sequelize');

class Database {
  constructor(uri, username, password) {
    const sequelize = new Sequelize(uri, username, password, {
      host: 'localhost',
      dialect: 'sqlite',
      logging: false,
      storage: 'database.sqlite'
    });

    this.User = sequelize.define('users', {
      discord_id: {
        type: Sequelize.BIGINT,
        unique: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    this.Player = sequelize.define('players', {});

    this.Game = Sequelize.define('games', {
      imposter_win: {
        type: Sequilize.BOOLEAN,
      }
    });

    this.Loby = sequelize.define('lobys', {});

    this.User.hasMany(this.Player, {as: 'players'});
    this.Game.hasMany(this.Player, {as: 'players'});
    this.Game.hasOne(this.Loby, {as: 'loby'});
    this.Loby.hasMany(this.Game, {as: 'games'});
    this.Player.hasOne(this.User, {as: 'user'});
    this.Player.hasOne(this.Game, {as: 'game'});
  }
  
  loadSchema() {
    this.User.sync();
    this.Game.sync();
    this.Loby.sync();
    this.Player.sync();
  }
}

module.exports = Database;
