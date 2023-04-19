@projectsFiltering

Feature: Filtering projects by Project Name, Project Lead and Department

	Background:
		Given user is on login page
		Given user logs in
		And projects page is displayed
	
		Scenario: Filtering by Project Name
		When filter projects by name button is clicked
		And 'e2e' project name is selected on filters list
		And apply filter button is clicked
		Then 'e2e' project is only project on list
		When filter projects by name button is clicked
		And reset filter button is clicked
		Then all projects are displayed on list

		Scenario: Filtering by Project Lead
		When filter projects by lead name button is clicked
		And 'Adam Herok' project lead name is selected on filters list
		And apply filter button is clicked
		Then 'Adam Herok' is only project lead on list
		When filter projects by lead name button is clicked
		And reset filter button is clicked
		Then all project leads are displayed on list
	
		Scenario: Filtering by Department
		When filter projects by department button is clicked
		And 'Euvic' department is selected on filters list
		And apply filter button is clicked
		Then 'Euvic' is only department on list
		When filter projects by department button is clicked
		And reset filter button is clicked
		Then all projects are displayed on list
	
		Scenario: Combined filtering
		When filter projects by department button is clicked
		And 'Euvic' department is selected on filters list
		And apply filter button is clicked
		And filter projects by lead name button is clicked
		And 'Adam Herok' project lead name is selected on filters list
		And apply filter button is clicked
		And filter projects by name button is clicked
		And 'e2e' project name is selected on filters list
		And apply filter button is clicked
		Then 'e2e' project is only project on list
		And 'Adam Herok' is only project lead on list
		And 'Euvic' is only department on list