@drawAttributes

Feature: Changing attributes of selected draw

	Background:
		Given user is on login page
		Given user logs in
		And user goes to calculate view

	Scenario: Verify Draw attributes section
		And user selects "Draw" object
		Then calculation pane contains draw section
		When user clicks draw section on calculation pane
		Then draw section attributes are hiden
		When user clicks draw section on calculation pane
		Then calculation pane contains draw section

	Scenario: Changing Draw attributes
		And user selects "Draw" object
		And user clicks on draw fill colour picker
		Then colour picker is displayed
		When user clicks on draw border style input
		Then draw border styles dropdown is displayed
		When user clicks on draw border colour picker
		Then colour picker is displayed
