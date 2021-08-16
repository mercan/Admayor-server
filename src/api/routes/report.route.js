const config = require("../../config/index");
const reportController = require("../controllers/report.controller");
const tokenVerifier = require("../../middleware/tokenVerifier");

const CreateReportSchema = require("../../schema/report/CreateReportSchema.json");

const routes = [
  {
    method: "GET",
    url: `/${config.apiVersion}/report/create`,
    schema: CreateReportSchema,
    preValidation: tokenVerifier,
    handler: reportController.createReport,
  },
];

module.exports = routes;
