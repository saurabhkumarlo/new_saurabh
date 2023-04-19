@circleAttributes

Feature: Changing attributes of selected circle

	Background:
		Given user is on login page
		Given user logs in
		And user goes to calculate view

	Scenario: Verify Circle attributes section
		And user selects "Circle" object
		Then calculation pane contains circle section
		When user clicks circle section on calculation pane
		Then circle section attributes are hiden
		When user clicks circle section on calculation pane
		Then calculation pane contains circle section

	Scenario: Changing Circle attributes
		And user selects "Circle" object
		And user clicks on circle fill colour picker
		Then colour picker is displayed
		And user clicks on circle border colour picker
		Then colour picker is displayed
		When user clicks on circle border style input
		Then circle border styles dropdown is displayed