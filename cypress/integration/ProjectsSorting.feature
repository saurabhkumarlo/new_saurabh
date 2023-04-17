@projectsFiltering
Feature: Sorting projects rows ascending and descending

	Background:
		Given user is on login page
		Given user logs in
		And projects page is displayed

	Scenario: Sort projects table rows 
		When sort projects by ID button is clicked
		Then projects table is sorted ascending by ID
		When sort projects by ID button is clicked
		Then projects table is sorted descending by ID
		When sort projects by number button is clicked
		Then projects table is sorted ascending by number
		When sort projects by number button is clicked
		Then projects table is sorted descending by number
		When sort projects by name button is clicked
		Then projects table is sorted ascending by name
		When sort projects by name button is clicked
		Then projects table is sorted descending by name
		When sort projects by lead button is clicked
		Then projects table is sorted ascending by lead
		When sort projects by lead button is clicked
		Then projects table is sorted descending by lead
		When sort projects by department button is clicked
		Then projects table is sorted ascending by department
		When sort projects by department button is clicked
		Then projects table is sorted descending by department