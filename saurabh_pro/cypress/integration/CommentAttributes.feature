@commentAttributes

Feature: Changing attributes of selected comment

	Background:
		Given user is on login page
		Given user logs in
		And user goes to calculate view

	Scenario: Verify Comment attributes section
		And user selects "Comment" object
		Then calculation pane contains comment section
		When user clicks comment section on calculation pane
		Then comment section attributes are hiden
		When user clicks comment section on calculation pane
		Then calculation pane contains comment section

	Scenario: Changing Comment attributes
		And user selects "Comment" object
		And user clicks on font button
		Then text fonts dropdown is displayed
		When user clicks on text decoration button
		Then decoration dropdown is displayed
		When user selects "bold" decoration 
		Then "bold" decoration is added
		When user selects "underline" decoration
		Then "underline" decoration is added
		When user selects "italic" decoration
		Then "italic" decoration is added
		When user selects "line-through" decoration
		Then "line-through" decoration is added
		When user clicks delete icon for "bold" decoration
		Then "bold" decoration is removed
		When user clicks delete icon for "underline" decoration
		Then "underline" decoration is removed
		When user clicks delete icon for "italic" decoration
		Then "italic" decoration is removed
		When user clicks delete icon for "line-through" decoration
		Then "line-through" decoration is removed
		And user clicks on comment text colour picker
		Then colour picker is displayed
		When user clicks on comment border colour picker
		Then colour picker is displayed
		When user clicks on comment border style input
		Then text border styles dropdown is displayed
		