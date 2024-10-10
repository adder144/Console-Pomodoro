const notifier = require('node-notifier');
const path = require('path');
const fs = require('fs');
const settingFilePath = path.join(__dirname, 'CustomSettings.json');
const StatsFilePath = path.join(__dirname, 'Stats.json');
const chalk = require('chalk');



const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});
let CustomDurations = [];

function StartPomodoro(WorkPeriod = 25, ShortBreakPeriod = 5, LongBreakPeriod = 15, CycleLength2 = 4){
    ClearConsole();
    const IntervalType = [['Starting Work Interval','Work Interval', "Ending Work Iterval"], ['Starting Short Break Interval','Short Break Interval','Ending Short Break Interval'], ['Starting Long Break Interval','Long Break Interval','Ending Long Break Interval']];
    const IntervalPeriod = [WorkPeriod*60, ShortBreakPeriod*60, LongBreakPeriod*60];
    let CycleLength = CycleLength2;
  
    let CurrentInterval = 0;
    let TotalBreakTime = 0;
    let TotalWorkTime = 0;
    let OverallCycle = 0;
    let WorkIntervals = 0;
    let ShortBreakIntervals = 0;
    let LongBreakIntervals = 0;
    let CountDown = IntervalPeriod[CurrentInterval];
    let CountUp = 0;
    let IntervalStatus = 0;
    let StartPomodoro = false;
    let ResumePomodoro = true;
    let StatusMessage = '';
    
    ClearConsole();
  
    PomodoroInstructions()  
  
    let Interval = setInterval(()=>{
        if(StartPomodoro && ResumePomodoro){
                
            let Min = parseInt( CountDown / 60); 
            let Sec = parseInt( CountDown % 60);
  
            if(Min.toString().length == 1) Min = "0"+Min;
            else Min = ""+Min;
  
            if(Sec.toString().length == 1) Sec = "0"+Sec;
            else Sec = ""+Sec;
  
            let TotalMin = parseInt(IntervalPeriod[CurrentInterval]/60);
            let TotalSec = parseInt(IntervalPeriod[CurrentInterval]%60);
  
            if(TotalMin.toString().length == 1) TotalMin = "0"+TotalMin;
            else TotalMin = ""+TotalMin;
  
            if(TotalSec.toString().length == 1) TotalSec = "0"+TotalSec;
            else TotalSec = ""+TotalSec;
  
            if(CountUp<30 && IntervalStatus != 0) {
                IntervalStatus = 0;
                process.stdout.clearLine();
            }else if(CountDown<30 && IntervalStatus != 2) {
                IntervalStatus = 2;
                process.stdout.clearLine();
            }else if(CountUp >= 30 && CountDown > 30 && IntervalStatus != 1) {
                IntervalStatus = 1;
                process.stdout.clearLine();
            }
  
  
            StatusMessage = `${chalk.bold(IntervalType[CurrentInterval][IntervalStatus])} ` +
          `| ${chalk.cyan('Total Time: ')} ${chalk.yellow(TotalMin)}:${chalk.yellow(TotalSec)} ` +
          `| ${chalk.green('Time Remaining:')} ${chalk.yellow(Min)}:${chalk.yellow(Sec)}\r`;
  
            process.stdout.write(StatusMessage);  
            
            CountUp++;
            CountDown--;
            //Updating Stats
            if(CurrentInterval == 0){TotalWorkTime++;}
            if(CurrentInterval == 1 || CurrentInterval == 2){TotalBreakTime++;}

  
            if(CountDown == 0){
                CountUp = 0;
                StartPomodoro = false;
                ClearConsole();
  
                if(CurrentInterval == 0){
                    WorkIntervals++;
                    Notification("Work Interval Over.");
                    console.log(`${chalk.blue('Work Interval Has Ended')}`)
    
                    if(WorkIntervals % CycleLength == 0) {
                        CurrentInterval = 2;
                        console.log(`${chalk.blue('Press 1 To Start Long Break Interval')}`);
                    }
                    else {
                        CurrentInterval = 1;
                        console.log(`${chalk.blue('Press 1 To Start Short Break Interval')}`);
                    }
  
                }else if(CurrentInterval == 1){
                    ShortBreakIntervals++;
                    Notification("Short Break Over.");
                    console.log(`${chalk.blue('Short Break Interval Has Ended')}`)
                    console.log(`${chalk.blue('Press 1 To Work Interval')}`)
  
                    CurrentInterval = 0;
  
                }else if(CurrentInterval == 2){
                    LongBreakIntervals++;
                    OverallCycle++;
                    Notification("Long Break Over.");
                    console.log(`${chalk.blue('Long Break Interval Has Ended')}`)
                    console.log(`${chalk.blue('Press 1 To Work Interval')}`)
  
                    CurrentInterval = 0;
  
  
                }else{
                    Notification("Pomodoro Error.")
  
                    process.exit(0);
                }
            
  
  
                CountDown = IntervalPeriod[CurrentInterval];
            }
  
            
  
        
        }
    }, 1);
  
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (key) => {
        if(key == 1){
            if(StartPomodoro == false){
                ClearConsole();
                StartPomodoro = true;
                ResumePomodoro = true;
    
            }else{
                ClearConsole();
                console.log("Pomodoro has already started");
                if(!ResumePomodoro){
                    process.stdout.write(StatusMessage);
                }
                setTimeout(() => {
                    ClearConsole();
                    if(!ResumePomodoro){
                        process.stdout.write(StatusMessage);
                    }
    
                },3000)
            }
            
        }else if(key == 2){
            StartPomodoro = false;
            ResumePomodoro = false;
            clearInterval(Interval);
            fs.readFile(StatsFilePath, 'utf8', (err, data) => {
                if (err) {
                  console.error('Error reading stats data', err);
                  setTimeout(() => {
                    InitiatePomodoro();
                  }, 2000);
                } else {
                    if(data === undefined || data == "") {
                        console.error('No stats data', err);
                        setTimeout(() => {
                            process.exit(0);
                        }, 2000);
              
        
                    }else{
                    let Stats = JSON.parse(data);
                    let TotalBreakTime2 = Stats[0] + TotalBreakTime;
                    let TotalWorkTime2 = Stats[1] + TotalWorkTime;
                    let TotalWorkCycle2 = Stats[2] + OverallCycle;
                    let TotalWorkIntervals2 = Stats[3]+ WorkIntervals;
                    let TotalShortBreakIntervals2 = Stats[4] + ShortBreakIntervals;
                    let TotalLongBreakIntervals2 = Stats[5] + LongBreakIntervals;
                    let StatsData = JSON.stringify([TotalBreakTime2,TotalWorkTime2,TotalWorkCycle2,TotalWorkIntervals2,TotalShortBreakIntervals2,TotalLongBreakIntervals2], null, 2)
                    
                    fs.writeFile(StatsFilePath, StatsData, (err) => {
                        if (err) {
                          console.error('\nError saving stats data', err);
                          process.exit(0);
        
                        } else {
                          console.log('\nStats data saved successfully');
                          process.exit(0);
        
                        }
                      });
        
                    
        
        
                }
        
                }
              });
        


            ClearConsole();
            console.log("Calling Exit")
  
        }else if(key == 3){
            ResumePomodoro = false;
            if(StartPomodoro){
                ClearConsole();
                console.log("\nPomodoro Pasued\n");
                PomodoroInstructions();
                process.stdout.write(StatusMessage);
  
            }else{
                ClearConsole();
                console.log(`${chalk.blue('Pomodoro Has Not Started Yet\n')}`)
                PomodoroInstructions();
  
            }
  
  
        }else if(key == 4){
            if(ResumePomodoro == false){
                if(StartPomodoro == true){
                    ClearConsole();
                    PomodoroInstructions();
                    ResumePomodoro = true;
    
                }else{
                    ClearConsole();
                    console.log(`${chalk.blue('Pomodoro Has Not Started Yet\n')}`)
                    PomodoroInstructions();
    
                }
  
            }else{
                if(StartPomodoro == true){
                    ClearConsole();
                    PomodoroInstructions();
    
                }else{
                    ClearConsole();
                    console.log(`${chalk.blue('Pomodoro Has Not Started Yet\n')}`)
                    PomodoroInstructions();
                    }
  
  
            }
  
        }else if(key == 5){
            if(StartPomodoro == true){
                CountDown = IntervalPeriod[CurrentInterval];
                CountUp = 0;
                ResumePomodoro = true;
                ClearConsole();    
                PomodoroInstructions();
  
            }else{
                ClearConsole();
                console.log(`${chalk.blue('Pomodoro Has Not Started Yet\n')}`)
                PomodoroInstructions();
  
            }         
        
  
        }else{
            ClearConsole();
            if(!StartPomodoro){
                console.log(`${chalk.blue('Pomodoro Has Not Started Yet\n')}`)
  
            }else if(!ResumePomodoro){
                console.log("\nPomodoro Pasued\n");
                PomodoroInstructions();
                process.stdout.write(StatusMessage);
    
            }else{
                PomodoroInstructions();
  
            }
  
  
        }
    });
  
  
  };
  

function CustomPomodoro(){
    let WorkPeriod = 0;
    let ShortBreakPeriod = 0;
    let LongBreakPeriod = 0;
    let CycleLength = 4;
    let SettingName = "";
    
    fs.readFile(settingFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading custom settings', err);
        } else {
            CustomDurations = JSON.parse(data);
        }
      });
    
      customMessage = `${chalk.bold.cyan("==========================================\n")} ` +
        `${chalk.yellow.bold("Please select an action from the list below:\n")}` +
        `${chalk.blue("1)")}${chalk.white(" Select from saved custom durations.")} \n` +
        `${chalk.blue("2)")}${chalk.white(" Create New Custom Durations.")}\n` +
        `${chalk.blue("3)")}${chalk.white(" Use Default Settings.\n")} ` +
        `${chalk.bold.cyan("==========================================\n")}`;


    rl.question(`${customMessage}`, input => {
        let chocie = parseInt(input, 10);
  
        if (isNaN(chocie) || chocie <= 0 || chocie > 3) {
            
            ClearConsole();
            console.log('Please enter a valid input.');
            CustomPomodoro();

        }else if(chocie == 1){
            ClearConsole();

            if(CustomDurations.length == 0){

                console.log(`There are no custom settings. Please create a custom settings or use default settings.`);
                CustomPomodoro();

            }
            console.log("List of Custom Settings");
            for(let i = 0; i < CustomDurations.length; i++) {

                console.log(`${i+1}) Setting Name: ${CustomDurations[i].CustomSettingName} | Work Period: ${CustomDurations[i].CustomWorkPeriod} | Short Break Period: ${CustomDurations[i].CustomShortBreakPeriod} | Long Break Period: ${CustomDurations[i].CustomLongBreakPeriod} | Cycle Length: ${CustomDurations[i].CustomCycleLength}`)
            }
            rl.question(`Enter the number of your chosen setting\n`, input => {
                let choice2 = parseInt(input, 10);
                if (isNaN(choice2) || choice2 <= 0 || choice2 > CustomDurations.length){
                    ClearConsole();  
                    console.log('Please enter a valid input.');
                    CustomPomodoro();    
                }else{
                    WorkPeriod = CustomDurations[choice2 - 1].CustomWorkPeriod;
                    ShortBreakPeriod = CustomDurations[choice2 - 1].CustomShortBreakPeriod;
                    LongBreakPeriod = CustomDurations[choice2 - 1].CustomLongBreakPeriod;
                    CycleLength = CustomDurations[choice2 - 1].CustomCycleLength;
                    SettingName = CustomDurations[choice2 - 1].CustomSettingName;
                    
                    ClearConsole();
                    console.log(`Starting Pomodoro with the custom setting: ${SettingName}.`);
        
                   
                    StartPomodoro(WorkPeriod,ShortBreakPeriod,LongBreakPeriod, CycleLength);                 
                }

            });


        }else if(chocie == 2){
            ClearConsole();

            rl.question(`What's is the name of this custom setting?\n`, name => {
                SettingName = name;
                rl.question(`Enter Number of Minuites for Work Interval\n`, input => {
                    WorkPeriod = parseInt(input, 10);
                    rl.question(`Enter Number of Minuites for Short Break Interval\n`, input => {
                        ShortBreakPeriod = parseInt(input, 10);
                        rl.question(`Enter Number of Minuites for Long Break Interval\n`, input => {
                            LongBreakPeriod = parseInt(input, 10);
                            rl.question(`Enter How Many Work Periods Occur before Long Break.\n`, input => {
                                CycleLength = parseInt(input, 10);

                                if (isNaN(WorkPeriod) || WorkPeriod <= 0 || isNaN(ShortBreakPeriod) || ShortBreakPeriod <= 0 || isNaN(LongBreakPeriod) || LongBreakPeriod <= 0 || isNaN(CycleLength) || CycleLength <= 0 || SettingName == "" ) {
                                    
                                    ClearConsole();
                                    console.log('Please enter valid values for all inputs.');
                                    CustomPomodoro();
                                }else{
                                    console.log("Setting Name: "+SettingName+"\nWork Period: "+WorkPeriod+"\nShort Break: "+ShortBreakPeriod+"\nLong Break: "+LongBreakPeriod+"\nCycle Length: "+CycleLength);

                                    rl.question(`\n1) Save Setting \n2) Discard Setting\n`, input => {
                                        let chocie = parseInt(input, 10);

                                        if (isNaN(chocie) || chocie <= 0 || chocie > 2) {
                                            ClearConsole();                           
                                            console.log('Please enter a valid input.');
                                            CustomPomodoro();
                                        }else if(chocie == 1){
                                            
                                            const setting = {CustomSettingName: SettingName, CustomWorkPeriod: WorkPeriod, CustomShortBreakPeriod:ShortBreakPeriod, CustomLongBreakPeriod: LongBreakPeriod, CustomCycleLength: CycleLength};
                                            CustomDurations.push(setting);
                                            fs.writeFile(settingFilePath, JSON.stringify(CustomDurations, null, 2), (err) => {
                                                if (err) {
                                                  console.error('Error saving custom setting', err);
                                                } else {
                                                  console.log('Custom setting saved successfully');
                                                }
                                              });
                                            ClearConsole();
                                            CustomPomodoro();

                                        }else if(chocie == 2){
                                            InitiatePomodoro();
                                        }
                                    });                                                                          
                                }
                            });                        
                        });                    
                    });                
                });                  
            });
            

        }else if(chocie == 3){
            ClearConsole();
            console.log("Starting Pomodoro with default setting.");
            StartPomodoro();
        }else{
            ClearConsole();
            console.log('Please enter a valid input.');
            CustomPomodoro();
        }

    });



}
function InitiatePomodoro(){

      ClearConsole();

      console.log(chalk.bold.cyan("\n=========================================="));
      console.log(chalk.bold.green("        Welcome to the Pomodoro Console App!"));
      console.log(chalk.bold.cyan("==========================================\n"));
      console.log(chalk.yellow.bold("Please select an action from the list below:\n"));     
      console.log(chalk.blue("1)") + chalk.white(" Start Pomodoro App with default settings."));
      console.log(chalk.blue("2)") + chalk.white(" Start Pomodoro App with custom settings."));
      console.log(chalk.blue("3)") + chalk.white(" View Pomodoro stats.\n"));
      console.log(chalk.cyan("==========================================\n"));

      rl.on('line', (input) => {
        if (input.trim() === '1') {
            ClearConsole();
            console.log("Starting Pomodoro with default setting.");
            StartPomodoro();
        }else if (input.trim() === '2'){
            ClearConsole();
            console.log("Input Pomodoro custom setting.");
            CustomPomodoro();
        }else if(input.trim() === '3'){
            ShowStats();
        }else{
            ClearConsole();
            console.log(`Please Enter a  valid Input.`);
            InitiatePomodoro();
        }
      });
      

}

function ShowStats(){
    fs.readFile(StatsFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading stats data', err);
          setTimeout(() => {
            InitiatePomodoro();
          }, 2000);
        } else {
            if(data === undefined || data == "") {
                console.error('No customs data', err);
                setTimeout(() => {
                  InitiatePomodoro();
                }, 2000);
      

            }else{
            let Stats = JSON.parse(data);
            let TotalBreakTime = Stats[0];
            let TotalWorkTime = Stats[1];
            let TotalWorkCycle = Stats[2];
            let TotalWorkIntervals = Stats[3];
            let TotalShortBreakIntervals = Stats[4];
            let TotalLongBreakIntervals = Stats[5];
            
            console.log(chalk.blue(`Total Work Time: ${parseInt(TotalWorkTime/60)} Min`));
            console.log(chalk.blue(`Total Break Time: ${parseInt(TotalBreakTime/60)} Min`));
            console.log(chalk.blue(`Total Work Intervals: ${TotalWorkIntervals}`));
            console.log(chalk.blue(`Total Short Break Intervals: ${TotalShortBreakIntervals}`));
            console.log(chalk.blue(`Total Long Break Intervals Time: ${TotalLongBreakIntervals}`));
            console.log(chalk.blue(`Total Work Cycle: ${TotalWorkCycle}`));

            setTimeout(() => {
              InitiatePomodoro();
            }, 7000);
  



        }

        }
      });


}
function ClearConsole(){
    console.log('\033[2J');
    readline.cursorTo(process.stdout, 0, 0);
}
function PomodoroInstructions(){
    console.log(
        chalk.bold.cyan("Choose an action:")
        + '\n' +
        chalk.green("1)") + " " + chalk.yellow("Start") +
        ' | ' +
        chalk.green("2)") + " " + chalk.yellow("Stop") +
        ' | ' +
        chalk.green("3)") + " " + chalk.yellow("Pause") +
        ' | ' +
        chalk.green("4)") + " " + chalk.yellow("Resume") +
        ' | ' +
        chalk.green("5)") + " " + chalk.yellow("Restart")
      );
  };
function Notification(SentMessage){
    notifier.notify({
        title: 'Pomodoro Notification',
        message: SentMessage,
        sound: true, 
        wait: true 
      }, function (err, response, metadata) {
        if (err) {
          console.error('Notification error:', err);
        } else {
        }
      });
    
}
InitiatePomodoro();