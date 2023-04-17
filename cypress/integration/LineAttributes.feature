@lineAttributes

Feature: Changing attributes of selected line

	Background:
		Given user is on login page
		Given user logs in
		And user goes to calculate view

	Scenario: Verify Line attributes section
		And user selects "Line" object
		Then calculation pane contains line section
		When user clicks line section on calculation pane
		Then line section attributes are hiden
		When user clicks line section on calculation pane
		Then calculation pane contains line section

	Scenario: Changing Line attributes
		And user selects "Line" object
		And user clicks on line fill colour picker
		Then colour picker is displayed
		When user clicks on line style input
		Then styles dropdown is displayed
		When user clicks on line start icon style button
		Then start icon style dropdown is displayed
		When user clicks on line end icon style button
		Then end icon style dropdown is displayed
