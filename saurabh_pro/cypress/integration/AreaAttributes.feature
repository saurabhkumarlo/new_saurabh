@areaAttributes

Feature: Changing attributes of selected area

	Background:
		Given user is on login page
		Given user logs in
		And user goes to calculate view

	Scenario: Verify Area attributes section
		And user selects "Area" object
		Then calculation pane contains area section
		When user clicks area section on calculation pane
		Then area section attributes are hiden
		When user clicks area section on calculation pane
		Then calculation pane contains area section

	Scenario: Changing Area attributes
		And user selects "Area" object
		And user clicks on area fill colour picker
		Then colour picker is displayed
		When user clicks on area border style input
		Then area border styles dropdown is displayed
		When user clicks on area border colour picker
		Then colour picker is displayed
