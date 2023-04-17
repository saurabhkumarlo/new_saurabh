const cypress = require("cypress")
const report = require("multiple-cucumber-html-reporter")

cypress.run().then(
	() => {
		generateReport()
	},
	(error) => {
		generateReport()
		console.error(error)
		process.exit(1)
	}
)

function generateReport() {
	return report.generate({
		jsonDir: "cypress/results/report/json",
		reportPath: "cypress/results/report/html",
		hideMetadata: true,
		displayReportTime: true,
	})
}
