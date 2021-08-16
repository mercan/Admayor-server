const ObjectId = require("mongoose").Types.ObjectId;
const adModel = require("../models/advertising");
const reportModel = require("../models/report");
const logger = require("../helpers/logger");

class ReportService {
  constructor() {
    this.reportModel = reportModel;
    this.adModel = adModel;
  }

  async create(report) {
    if (!this.isValidId(report.adId)) {
      return { error: "Invalid ad ID." };
    }

    const adRecord = await this.adModel.findById(
      report.adId,
      "configurations.type configurations.isActive"
    );

    if (!adRecord) {
      return { error: "Invalid ad ID." };
    }

    if (!adRecord.configurations[0].isActive) {
      return { error: "Ad is not active." };
    }

    const reportRecord = await this.reportModel.findOne(
      { adId: report.adId },
      "reports.userId"
    );

    if (reportRecord) {
      const userIdCheck = reportRecord.reports.find(
        (el) => el.userId == report.userId
      );

      if (userIdCheck) {
        return { error: "Report already exists." };
      }

      await this.reportModel.updateOne(
        { adId: report.adId },
        { $push: { reports: report } }
      );

      return { message: "The report has been created." };
    }

    await this.reportModel.create({
      adId: report.adId,
      adType: adRecord.configurations[0].type,
      reports: report,
    });

    return { message: "The report has been created." };
  }

  isValidId(userId) {
    return ObjectId.isValid(userId);
  }
}

module.exports = new ReportService();
