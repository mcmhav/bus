const fetch = require('node-fetch');
const dateFns = require('date-fns');
const cTable = require('console.table');
const argv = require('minimist')(process.argv.slice(2));

const today = new Date();
const todayDate = dateFns.format(today, 'DD.MM.YYYY');
// today.getDate() + "." + (today.getMonth() + 1) + "." + today.getUTCFullYear();

const TO_BUSS_TIME = argv.l || 5;
const COUNT = argv.c || 5;
const HOURS = argv.h || dateFns.format(today, 'HH');
const MINUTES = argv.m || dateFns.format(today, 'mm');
const STOP_ID = argv.s || '2190022';

const startTime = HOURS + ':' + MINUTES;

var urlBase = 'https://ruter.no/webapi/getstopdepartures';

var urlQuery =
  `?stopId=${STOP_ID}` +
  '&language=no' +
  `&startTime=${encodeURIComponent(startTime)}` +
  `&date=${encodeURIComponent(todayDate)}` +
  '&selectedLines=undefined';

var url = urlBase + urlQuery;

const colorText = (text, color) => {
  switch (color) {
    case 'red':
      return `\x1b[31m${text}\x1b[0m`;
    case 'green':
      return `\x1b[32m${text}\x1b[0m`;
    case 'yellow':
      return `\x1b[33m${text}\x1b[0m`;
    case 'magneta':
      return `\x1b[35m${text}\x1b[0m`;
    default:
      return text;
  }
};

const statusToColor = status => {
  switch (status) {
    case 'success':
      return 'green';
    case 'error':
      return 'red';
    case 'aborted':
      return 'yellow';
    case 'on-hold':
      return 'magneta';
    default:
      return null;
  }
};

fetch(url, {})
  .then(res => {
    return res.status === 200 && res.json();
  })
  .then(json => {
    json.platforms.forEach(platform => {
      if (platform.name === '1') {
        const deps = [];
        platform.lines.forEach(line => {
          line.departures.forEach(departure => {
            const time = departure.departureTime;
            const remaining = departure.remainingMinutes;

            // console.log(departure.departureTime + ' - ' + departure.remainingMinutes);
            const leaveAt = remaining - TO_BUSS_TIME;
            if (leaveAt >= 0) {
              let added = false;
              const toAdd = { name: line.name, time, remaining, leaveAt };

              deps.forEach((dep, index) => {
                if (dep.remaining > remaining && !added) {
                  deps.splice(index, 0, toAdd);
                  added = true;
                }
              });
              if (!added) {
                deps.push(toAdd);
              }
            }
          });
        });

        const table = cTable.getTable(deps.slice(0, COUNT));
        console.log(table);
      }
    });
  });
