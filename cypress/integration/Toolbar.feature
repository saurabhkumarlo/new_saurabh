@toolbarTests
Feature: Checking toolbar

	Background:
		Given user is on login page
		Given user logs in
		And user goes to calculate view

	Scenario: Verify toolbars buttons
		Then toolbar section is displayed
		And all buttons are clickable

	Scenario: Download the project
		When user clicks on download button
		Then project is downloaded

	Scenario: Project export
		When user clicks on export button
		Then export popup is displayed
		And button Export to CSV is displayed
		And button Copy to Clipboard is displayed
		And user can export folder 
		And user can export object
		And user can export object - net
		And user can export object - without structure
		And user can export rows
		And user can export rows - sum
		And user can export rows - sum per project
		And user can export BidCon