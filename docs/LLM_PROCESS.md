All code has been written by AI. I decided on the architecture and read through each line AI implemented.

The only AI I use is Codex.

Before asking AI to implement something, I start by asking it "how would you implement this"

I also end all my prompts with: 

"Make  sure to check the .md files and lab instructions

Use readable code, avoid bloating and overcomplications. Don't add something I did not ask for.
When you're done, Id like you to re read it and ask if its readable and overcomplicated, if it is then fix that (once)"

Sesson 1: 2026-11-22 14-18 (with some breaks)

Implemented View for home screen and day details, showing hourly forecast per day. Also implemented parser, weatherService using kth proxy, viewmodel and helped groupForecastByDay.ts
AI implemented everything fast but it took some around 15 minutes to understand everything in parser and weatherService


The only mistake AI has made as of now is a design mistake in homescreen, making the user have to scroll down all hourly forecasts for the day before the user can view other days, changed it so todays hourly forecasts instead show in a scrollbar.




