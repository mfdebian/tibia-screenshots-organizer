import { cp, mkdir, readdir, stat } from 'node:fs/promises';
import { loadEnvFile } from 'node:process';

loadEnvFile('.env.local');

const screenshots = await readdir(process.env.SSDIR);
const outputDir = process.env.OSSDIR;

const getEventsByChar = (screenshots) => {
  let events = screenshots.reduce((acc, memo) => {
    let eventFile = memo.split('_')[memo.split('_').length - 1];
    let event = eventFile.slice(0, eventFile.length - 4);
    let char = memo.split('_')[2];

    if (!Object.keys(acc).includes(char)) {
      acc[char] = [];
    }

    if (!acc[char].includes(event)) {
      acc[char].push(event);
    }

    return acc;
  }, {});

  return events;
};

const checkAndMakeDirectory = async (dir) => {
  try {
    await stat(dir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        await mkdir(dir);
      } catch (err) {
        console.error(err.message);
      }
    }
  }
};

const makeCharEventsDirectories = async (eventsByChar) => {
  Object.keys(eventsByChar).forEach(async (char) => {
    await checkAndMakeDirectory(`${outputDir}/${char}`);
    eventsByChar[char].forEach(async (event) => {
      try {
        await checkAndMakeDirectory(`${outputDir}/${char}/${event}`);
      } catch (e) {
        console.log(e);
      }
    });
  });
};

const copyScreenshots = async (screenshots, eventsByChar) => {
  screenshots.forEach((ss) => {
    let char = ss.split('_')[2];
    eventsByChar[char].forEach(async (event) => {
      if (ss.includes(char) && ss.includes(event)) {
        await cp(
          `${process.env.SSDIR}/${ss}`,
          `${outputDir}/${char}/${event}/${ss}`,
        );
      }
    });
  });
};

const eventsByChar = getEventsByChar(screenshots);
await makeCharEventsDirectories(eventsByChar);
await copyScreenshots(screenshots, eventsByChar);
