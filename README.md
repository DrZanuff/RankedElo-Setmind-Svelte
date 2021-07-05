Rank Online for Setmind School, this is a Gamification Tool that show the scores of the students, getting data from a Google Sheet.

https://rankedelo-setmind.netlify.app

Here is the Link fo the Google Sheet and the code in Google AppScript if you need to make an copy of the Spreadsheet.

https://docs.google.com/spreadsheets/d/1K8O9bve_4IHo94muNLkV42fLLaLL7oUm-okoebHI0lQ/edit?usp=sharing

## Technologies
* Svelte
* Google Sheets
* Google AppScript
* Netlify Continuous Deployment

## Pictures

##### Basic Mode
![Image](https://i.postimg.cc/vZW7zZQ7/Print2.png)

##### Teams Mode (Trio Mode)
![Image](https://i.postimg.cc/0NPYH1QT/Print1.png)

##### Teacher's Sheet
![Image](https://i.postimg.cc/x1ryMzST/Print3.png)

##### Sheet Settings
![Image](https://i.postimg.cc/Wbqwd7CH/Print4.png)

## Objective

The implemented Gamification is very simple. Students have a deadline to build a project and deliver activities during that deadline. Each activity is worth points which are the columns in the spreadsheet. When the student reaches a given score, he moves up from Elo, up to another table.

It is also possible to create teams of three members, where a parallel competition takes place between the trios.

The tool's initial technology was React, but I migrated to Svelte because it is easier to understand by the team responsible for maintaining the system and has a shorter learning curve.
