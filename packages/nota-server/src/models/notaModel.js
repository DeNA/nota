const { Model, DataTypes, Op } = require("sequelize");

class NotaModel extends Model {}

NotaModel.prototype.transformToResponse = function() {};

module.exports = NotaModel;
