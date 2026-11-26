All code has been written by AI. I decided on the architecture and read through each line AI implemented.

The only AI I use is Codex.
    
All context files were used for both sessions   


## Who wrote what   

This factual table was added by Codex at the student's request. The personal account below was written by the student.

| Part | Who wrote it | Student's contribution |
| --- | --- | --- |
| Architecture | Student decisions, Codex advice | Proposed MVVM and discussed the structure before implementation. |
| Models, parsers, and services | Codex | Requested small steps and reviewed the generated code. |
| ViewModel and storage | Codex | Chose the approach, asked for explanations, and reviewed the implementation. |
| Screens, navigation, and layout | Codex | Requested UI changes, including sideways hours, a larger place name, and simpler text. |
| Grouping and display helpers | Codex | Asked how the grouping works and requested consistent naming. |


## Prompts and sessions

Before asking AI to implement something, I start by asking it "how would you implement this"

I also end all my prompts with: 

"Make  sure to check the .md files and lab instructions

Use readable code, avoid bloating and overcomplications. Don't add something I did not ask for.
When you're done, Id like you to re read it and ask if its readable and overcomplicated, if it is then fix that (once)"

This was chosen because I often find LLMS to overcomplicate stuff and add things not asked for.

Other representative prompts were:

“Viewmodel has export function UseViewModel() that returns functions inside it, Viewmodel can call service and includes a model. This is what I had planned, is it good idea?” 

This was chosen because I wanted to plan the architecture instead of just letting ai make all decisions

And:
"Start by writing the model for me. Use readable code, avoid bloating and overcomplications. Don't add something I did not ask for."
This was chosen because it represents how I used AI to implement things in small step so I could understand it and avoid overcomplicated things.



Sesson 1: 2026-11-22 14-18 (with some breaks)

Implemented View for home screen and day details, showing hourly forecast per day. Also implemented parser, weatherService using kth proxy, viewmodel and helped groupForecastByDay.ts
AI implemented everything fast but it took some around 15 minutes to understand everything in parser and weatherService


The only mistake AI has made as of now is a design mistake in homescreen, making the user have to scroll down all hourly forecasts for the day before the user can view other days, changed it so todays hourly forecasts instead show in a scrollbar.


Sesson 2: 2026-11-22 20-00

Implemented favourites, storage for favourites and last viewed location. 
Also implemented landscape support, home details and lastly I changed to SMHI instead of KTH proxy server.

While AI didnt make any technical mistakes it made design mistakes (according to myself), it made added unnecessary text, aswell as making the name of the location shown very small. 

In the code it also mixed up names, like place and location being the same thing but having different names in different function made it confusing.
