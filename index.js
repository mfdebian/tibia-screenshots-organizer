import { cp, mkdir, readdir } from 'node:fs/promises';
import { loadEnvFile } from 'node:process';

loadEnvFile('.env.local');

const screenshots = await readdir(process.env.SSDIR);

const charName = process.env.CHARNAME;
const charDir = `${process.env.OSSDIR}/${charName}`

let charScreenshots = screenshots.filter((file) => file.includes(charName));

const getCharEvents = (charScreenshots) => {
  let events = charScreenshots.reduce((acc, memo) => {
    let eventFile = memo.split('_')[memo.split('_').length-1];
    let event = eventFile.slice(0, eventFile.length-4);
    if (!acc.includes(event)) {
      acc.push(event);
    }
    return acc;
    
  }, []);

  return events;
};


const makeCharEventsDirectories = async (charEvents) => {
  await mkdir(charDir);
  charEvents.forEach(async (event) => {
    try {
      await mkdir(`${charDir}/${event}`);
    } catch (e) {
      console.log(e);
    }
  });  
};

const copySS = async (charScreenshots, charEvents) => {
  charEvents.forEach((event) => {
    charScreenshots.forEach(async (ss) => {
      if (ss.includes(event)) {
        await cp(`${process.env.SSDIR}/${ss}`, `${charDir}/${event}/${ss}`);
      }
    });
  });
};

let charEvents = getCharEvents(charScreenshots);
await makeCharEventsDirectories(charEvents);
await copySS(charScreenshots, charEvents);

