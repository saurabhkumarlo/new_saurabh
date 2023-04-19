@areaAttributes

Feature: Changing attributes of selected point

	Background:
		Given user is on login page
		Given user logs in
		And user goes to calculate view

	Scenario: Verify Point attributes section
		And user selects "Point" object
		Then calculation pane contains point section
		When user clicks point section on calculation pane
		Then point section attributes are hiden
		When user clicks point section on calculation pane
		Then calculation pane contains point section

	Scenario: Changing Area attributes
		And user selects "Point" object
		And user clicks on point fill colour picker
		Then colour picker is displayed
		When user clicks on point icon style input
		Then point icon styles dropdown is displayed
