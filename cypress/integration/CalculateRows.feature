@calculateRows

Feature: Adding, modifying and saving rows for annotations

Background:
	Given user is on login page
	Given user logs in
	And user goes to calculate view


Scenario: Adding new row with input
	When user selects "Area to add and delete rows" object
	And user clicks on add new row input
	And user enters new row data
	Then new row is added to annotation

Scenario: Deleting added row
	When user selects "Area to add and delete rows" object
	And user selects recently added row
	And user clicks RMB on selected row
	When user selects "Delete" from rows context menu
	Then selected row is deleted

Scenario: Copying rows with tree context menu
	When user clicks RMB on "Area with rows to copy"
	And user selects "Copy Rows" from tree context menu 
	When user selects "Area to paste rows" object
	And user clicks RMB on "Area to paste rows"
	And user selects "Paste Rows" from tree context menu
	Then copied rows are added to annotation 

Scenario: Replacing rows with tree context menu
	When user clicks RMB on "Area with rows to replace"
	And user selects "Copy Rows" from tree context menu 
	When user selects "Area to paste rows" object
	And user clicks RMB on "Area to paste rows"
	And user selects "Replace Rows" from tree context menu
	Then replace rows confirmation screen is displayed
	When user confirms to replace rows
	Then copied rows replaces previous one 

Scenario: Deleting multiple rows
	When user selects "Area to paste rows" object
	And user selects all rows
	And user clicks RMB on selected row
	And user selects "Delete" from rows context menu
	Then confirmation screen for deleting multiple rows is displayed
	When user confirms to delete multiple rows 
	Then selected row is deleted